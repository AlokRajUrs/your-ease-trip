import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Calendar, Heart, Loader2, Clock, DollarSign, Bus, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  best_time_to_visit: string;
  highlights: string[];
  image_url: string;
  visiting_hours?: string;
  entry_fee?: string;
  transport_details?: string;
  distance_from_town?: string;
  travel_time?: string;
  location_coordinates?: string;
}

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDestination();
      checkIfSaved();
    }
  }, [id]);

  const fetchDestination = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDestination(data);
    } catch (error: any) {
      toast.error('Failed to load destination');
      navigate('/destinations');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('saved_destinations')
        .select('id')
        .eq('user_id', user.id)
        .eq('destination_id', id)
        .maybeSingle();

      setIsSaved(!!data);
    } catch (error) {
      // Silently fail
    }
  };

  const handleSaveDestination = async () => {
    if (!user || !destination) return;

    try {
      if (isSaved) {
        await supabase
          .from('saved_destinations')
          .delete()
          .eq('user_id', user.id)
          .eq('destination_id', destination.id);
        setIsSaved(false);
        toast.success('Removed from saved destinations');
      } else {
        await supabase
          .from('saved_destinations')
          .insert({
            user_id: user.id,
            destination_id: destination.id,
          });
        setIsSaved(true);
        toast.success('Added to saved destinations');
      }
    } catch (error: any) {
      toast.error('Failed to update saved destinations');
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

  if (!destination) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/destinations')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Destinations
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <img
              src={destination.image_url}
              alt={destination.name}
              className="w-full h-[400px] object-cover rounded-lg shadow-hover"
            />
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {destination.name}
                </h1>
                <p className="text-lg text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {destination.country}
                </p>
              </div>
              <Button
                variant={isSaved ? "default" : "outline"}
                size="icon"
                onClick={handleSaveDestination}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{destination.description}</p>
              </CardContent>
            </Card>

            {destination.best_time_to_visit && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Best Time to Visit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{destination.best_time_to_visit}</p>
                </CardContent>
              </Card>
            )}

            {destination.highlights && destination.highlights.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {destination.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {(destination.visiting_hours || destination.entry_fee) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Visiting Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {destination.visiting_hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Visiting Hours</p>
                        <p className="text-muted-foreground">{destination.visiting_hours}</p>
                      </div>
                    </div>
                  )}
                  {destination.entry_fee && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Entry Fee</p>
                        <p className="text-muted-foreground">{destination.entry_fee}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(destination.transport_details || destination.distance_from_town) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    How to Reach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {destination.distance_from_town && (
                    <div className="flex items-start gap-3">
                      <Navigation className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Distance & Travel Time</p>
                        <p className="text-muted-foreground">
                          {destination.distance_from_town}
                          {destination.travel_time && ` • ${destination.travel_time}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {destination.transport_details && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {destination.transport_details}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {destination.location_coordinates && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden border">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${destination.location_coordinates}&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex gap-4">
              <Button 
                onClick={() => {
                  if (!user) {
                    toast.error('Please log in to explore packages for this destination');
                    navigate('/auth');
                    return;
                  }
                  navigate(`/packages?destination=${id}`);
                }}
                className="flex-1"
              >
                View Packages
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (!user) {
                    toast.error('Please log in to find hotels for this destination');
                    navigate('/auth');
                    return;
                  }
                  navigate(`/hotels?destination=${id}`);
                }}
                className="flex-1"
              >
                Find Hotels
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
