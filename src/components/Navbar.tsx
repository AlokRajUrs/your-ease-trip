import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, ShoppingCart, LogOut } from 'lucide-react';
import logo from '@/assets/logo.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="TripTastic Holidays" className="h-10 w-auto" />
          </Link>

          {user ? (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/destinations" className="text-foreground hover:text-primary transition-colors">
                  Destinations
                </Link>
                <Link to="/packages" className="text-foreground hover:text-primary transition-colors">
                  Packages
                </Link>
                <Link to="/booking" className="text-foreground hover:text-primary transition-colors">
                  Booking
                </Link>
                <Link to="/hotels" className="text-foreground hover:text-primary transition-colors">
                  Hotels
                </Link>
                <Link to="/shopping" className="text-foreground hover:text-primary transition-colors">
                  Shopping
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/shopping')}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
