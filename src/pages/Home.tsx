import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Package, Hotel, ShoppingBag, Star, TrendingUp } from 'lucide-react';
import heroImage from '@/assets/hero-travel.jpg';
import Navbar from '@/components/Navbar';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: 'Popular Destinations',
      description: 'Explore the most beautiful places around the world',
      action: () => navigate('/destinations'),
    },
    {
      icon: Package,
      title: 'Travel Packages',
      description: 'Complete packages with itineraries and accommodations',
      action: () => navigate('/packages'),
    },
    {
      icon: Hotel,
      title: 'Best Hotels',
      description: 'Find the perfect stay for every budget',
      action: () => navigate('/hotels'),
    },
    {
      icon: ShoppingBag,
      title: 'Travel Essentials',
      description: 'Shop for all your travel needs',
      action: () => navigate('/shopping'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Tropical paradise" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-ocean/60" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Your Journey Begins Here
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow">
            Discover amazing destinations, book unforgettable experiences, and create memories that last a lifetime
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/destinations')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
            >
              Explore Destinations
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/packages')}
              className="bg-white/90 hover:bg-white text-primary border-white shadow-lg"
            >
              View Packages
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for the Perfect Trip
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From destination discovery to accommodation booking, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-card hover:shadow-hover transition-all cursor-pointer group"
                onClick={feature.action}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="h-8 w-8" />
                <div className="text-4xl font-bold">500+</div>
              </div>
              <p className="text-lg text-white/90">Destinations</p>
            </div>
            <div className="text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-8 w-8" />
                <div className="text-4xl font-bold">10K+</div>
              </div>
              <p className="text-lg text-white/90">Happy Travelers</p>
            </div>
            <div className="text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-8 w-8" />
                <div className="text-4xl font-bold">95%</div>
              </div>
              <p className="text-lg text-white/90">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-3xl mx-auto shadow-hover border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Ready to Start Your Adventure?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of travelers who trust TripTastic Holidays for their journeys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                onClick={() => navigate('/destinations')}
                className="w-full sm:w-auto"
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
