import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Package {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  duration_nights: number;
  price: number;
  image_url: string;
  includes: string[];
  destinations: { name: string; country: string } | null;
}

const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          destinations (name, country)
        `)
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleBookPackage = async (pkg: Package) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7); // Default start date in 7 days
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + pkg.duration_days);

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_type: 'package',
          package_id: pkg.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_price: pkg.price,
          passengers: 1,
        });

      if (error) throw error;
      toast.success('Package booked successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error('Failed to book package');
    }
  };

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
            Travel Packages
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All-inclusive packages with detailed itineraries for unforgettable experiences
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No packages available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className="shadow-card hover:shadow-hover transition-all group overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-accent text-accent-foreground">
                      {pkg.duration_days}D / {pkg.duration_nights}N
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{pkg.name}</CardTitle>
                  {pkg.destinations && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {pkg.destinations.name}, {pkg.destinations.country}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {pkg.description}
                  </p>
                  
                  {pkg.includes && pkg.includes.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-sm mb-2">Includes:</p>
                      <ul className="space-y-1">
                        {pkg.includes.slice(0, 3).map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-1">
                            <span className="text-primary mt-0.5">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                      <DollarSign className="h-5 w-5" />
                      {pkg.price}
                    </div>
                    <Button 
                      onClick={() => handleBookPackage(pkg)}
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

export default Packages;
