import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Loader2, MapPin, Package, Hotel as HotelIcon, Ticket, Heart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  booking_type: string;
  start_date: string;
  end_date: string | null;
  total_price: number;
  status: string;
  packages: { name: string } | null;
  hotels: { name: string } | null;
  ticket_details: any;
}

interface SavedDestination {
  id: string;
  destinations: {
    id: string;
    name: string;
    country: string;
    image_url: string;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [bookingsRes, savedRes] = await Promise.all([
        supabase
          .from('bookings')
          .select(`
            *,
            packages (name),
            hotels (name)
          `)
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('saved_destinations')
          .select(`
            id,
            destinations (id, name, country, image_url)
          `)
          .eq('user_id', user!.id)
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (savedRes.error) throw savedRes.error;

      setBookings(bookingsRes.data || []);
      setSavedDestinations(savedRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedDestination = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_destinations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSavedDestinations(savedDestinations.filter(d => d.id !== id));
      toast.success('Destination removed');
    } catch (error: any) {
      toast.error('Failed to remove destination');
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      setBookings(bookings.filter(b => b.id !== id));
      toast.success('Booking cancelled');
    } catch (error: any) {
      toast.error('Failed to cancel booking');
    }
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'package': return <Package className="h-4 w-4" />;
      case 'hotel': return <HotelIcon className="h-4 w-4" />;
      case 'ticket': return <Ticket className="h-4 w-4" />;
      default: return null;
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-lg text-muted-foreground">
            Manage your bookings and saved destinations
          </p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="saved">Saved Destinations</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No bookings yet</p>
                    <Button onClick={() => navigate('/packages')}>
                      Browse Packages
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id} className="shadow-card hover:shadow-hover transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 mb-2">
                            {getBookingIcon(booking.booking_type)}
                            {booking.booking_type === 'package' && booking.packages?.name}
                            {booking.booking_type === 'hotel' && booking.hotels?.name}
                            {booking.booking_type === 'ticket' && 
                              `${booking.ticket_details?.transport_type} Ticket`}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.start_date).toLocaleDateString()}
                            {booking.end_date && ` - ${new Date(booking.end_date).toLocaleDateString()}`}
                          </CardDescription>
                        </div>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {booking.booking_type === 'ticket' && booking.ticket_details && (
                        <p className="text-muted-foreground mb-2">
                          {booking.ticket_details.from} → {booking.ticket_details.to}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">Total Price</span>
                        <span className="text-xl font-bold text-primary">
                          ₹{booking.total_price}
                        </span>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDestinations.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No saved destinations yet</p>
                    <Button onClick={() => navigate('/destinations')}>
                      Explore Destinations
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                savedDestinations.map((saved) => (
                  <Card 
                    key={saved.id} 
                    className="shadow-card hover:shadow-hover transition-all group overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/destinations/${saved.destinations.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={saved.destinations.image_url}
                        alt={saved.destinations.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-1">
                            {saved.destinations.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {saved.destinations.country}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedDestination(saved.id);
                          }}
                        >
                          <Heart className="h-5 w-5 fill-current text-primary" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
