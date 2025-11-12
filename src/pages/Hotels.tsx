import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Star, DollarSign, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Hotel {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  rating: number;
  image_url: string;
  amenities: string[];
  distance_from_center: string;
  budget_category: string;
  destinations: { name: string; country: string } | null;
}

const Hotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          destinations (name, country)
        `)
        .order('rating', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (error: any) {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleBookHotel = async (hotel: Hotel) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2); // 2 nights default

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_type: 'hotel',
          hotel_id: hotel.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_price: hotel.price_per_night * 2,
        });

      if (error) throw error;
      toast.success('Hotel booked successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error('Failed to book hotel');
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.destinations?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hotel.budget_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose from budget-friendly to luxury accommodations
          </p>

          <div className="max-w-md mx-auto mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search hotels or destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All Hotels
            </Button>
            <Button
              variant={selectedCategory === 'budget' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('budget')}
            >
              Budget
            </Button>
            <Button
              variant={selectedCategory === 'mid-range' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('mid-range')}
            >
              Mid-Range
            </Button>
            <Button
              variant={selectedCategory === 'luxury' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('luxury')}
            >
              Luxury
            </Button>
          </div>
        </div>

        {filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No hotels found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <Card 
                key={hotel.id} 
                className="shadow-card hover:shadow-hover transition-all group overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-background/90 text-foreground capitalize">
                      {hotel.budget_category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-background/90 px-2 py-1 rounded flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">{hotel.rating}</span>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{hotel.name}</CardTitle>
                  {hotel.destinations && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {hotel.destinations.name}, {hotel.destinations.country}
                    </CardDescription>
                  )}
                  {hotel.distance_from_center && (
                    <p className="text-sm text-muted-foreground">
                      {hotel.distance_from_center} from center
                    </p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {hotel.description}
                  </p>
                  
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">per night</p>
                      <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                        <DollarSign className="h-5 w-5" />
                        {hotel.price_per_night}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleBookHotel(hotel)}
                      className="group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hotels;
