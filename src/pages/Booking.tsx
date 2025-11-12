import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Train, Bus, Car } from 'lucide-react';
import { toast } from 'sonner';

const Booking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1,
    transportType: 'train',
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const basePrice = bookingData.transportType === 'train' ? 50 : 
                       bookingData.transportType === 'bus' ? 30 : 100;
      const totalPrice = basePrice * bookingData.passengers;

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_type: 'ticket',
          start_date: bookingData.date,
          total_price: totalPrice,
          passengers: bookingData.passengers,
          ticket_details: {
            from: bookingData.from,
            to: bookingData.to,
            transport_type: bookingData.transportType,
          },
        });

      if (error) throw error;
      toast.success('Booking confirmed successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Book Your Journey
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose your preferred mode of transportation
            </p>
          </div>

          <Card className="shadow-hover">
            <CardHeader>
              <CardTitle>Travel Booking</CardTitle>
              <CardDescription>Fill in your travel details</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="train" onValueChange={(value) => setBookingData({...bookingData, transportType: value})}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="train" className="flex items-center gap-2">
                    <Train className="h-4 w-4" />
                    Train
                  </TabsTrigger>
                  <TabsTrigger value="bus" className="flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    Bus
                  </TabsTrigger>
                  <TabsTrigger value="vehicle" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleBooking} className="mt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">From</Label>
                      <Input
                        id="from"
                        placeholder="Departure city"
                        value={bookingData.from}
                        onChange={(e) => setBookingData({...bookingData, from: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        placeholder="Destination city"
                        value={bookingData.to}
                        onChange={(e) => setBookingData({...bookingData, to: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Travel Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passengers">Number of Passengers</Label>
                      <Select
                        value={bookingData.passengers.toString()}
                        onValueChange={(value) => setBookingData({...bookingData, passengers: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Passenger' : 'Passengers'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Base Price per Person:</span>
                      <span className="font-semibold">
                        ${bookingData.transportType === 'train' ? 50 : 
                          bookingData.transportType === 'bus' ? 30 : 100}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Price:</span>
                      <span className="text-primary">
                        ${(bookingData.transportType === 'train' ? 50 : 
                           bookingData.transportType === 'bus' ? 30 : 100) * bookingData.passengers}
                      </span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Booking;
