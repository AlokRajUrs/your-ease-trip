import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PackageItinerary {
  id: string;
  day_number: number;
  title: string;
  description: string;
  activities: string[];
  meals_included: string[];
}

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
  package_itinerary: PackageItinerary[];
}

const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const destinationId = searchParams.get('destination');

  useEffect(() => {
    fetchPackages();
  }, [destinationId]);

  const fetchPackages = async () => {
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          destinations (name, country),
          package_itinerary (
            id,
            day_number,
            title,
            description,
            activities,
            meals_included
          )
        `);
      
      if (destinationId) {
        query = query.eq('destination_id', destinationId);
      }
      
      const { data, error } = await query.order('price', { ascending: true });

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
            {packages.length > 0 && packages[0].destinations?.name 
              ? `${packages[0].destinations.name} Packages – Coffee, Hills & Adventure`
              : 'Travel Packages'}
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

                  {pkg.package_itinerary && pkg.package_itinerary.length > 0 && (
                    <div className="mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between p-2 h-auto"
                        onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
                      >
                        <span className="font-semibold text-sm">View Itinerary</span>
                        {expandedPackage === pkg.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {expandedPackage === pkg.id && (
                        <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                          {pkg.package_itinerary
                            .sort((a, b) => a.day_number - b.day_number)
                            .map((day) => (
                              <div key={day.id} className="border-l-2 border-primary pl-3">
                                <p className="font-semibold text-sm text-primary">
                                  Day {day.day_number}: {day.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {day.description}
                                </p>
                                {day.activities && day.activities.length > 0 && (
                                  <div className="mt-1">
                                    <p className="text-xs font-medium">Activities:</p>
                                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                                      {day.activities.map((activity, idx) => (
                                        <li key={idx}>{activity}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <p className="text-2xl font-bold text-primary">
                      ₹{pkg.price}
                    </p>
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
