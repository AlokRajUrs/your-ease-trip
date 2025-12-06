import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Smartphone, Banknote, Check, Loader2 } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showUpiInput, setShowUpiInput] = useState(false);
  const directBuy = location.state?.directBuy || false;

  useEffect(() => {
    if (location.state?.items) {
      setItems(location.state.items);
    } else if (user) {
      fetchCart();
    }
  }, [location.state, user]);

  useEffect(() => {
    setShowUpiInput(paymentMethod === 'upi');
  }, [paymentMethod]);

  const fetchCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems = (data || []).map(item => ({
        id: (item.products as any).id,
        name: (item.products as any).name,
        price: (item.products as any).price,
        quantity: item.quantity,
        image_url: (item.products as any).image_url,
      }));
      setItems(cartItems);
    } catch (error: any) {
      toast.error('Failed to load cart');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;

  const validateUpiId = (id: string) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(id);
  };

  const handleConfirmOrder = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    if (paymentMethod === 'upi' && !validateUpiId(upiId)) {
      toast.error('Please enter a valid UPI ID (e.g., yourname@upi)');
      return;
    }

    setProcessing(true);
    try {
      // Simulate payment processing for UPI
      if (paymentMethod === 'upi') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const paymentStatus = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid via UPI';
      const paymentMethodDisplay = paymentMethod === 'cod' ? 'Cash on Delivery' : `UPI (${upiId})`;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          payment_method: paymentMethodDisplay,
          payment_status: paymentStatus,
          status: 'processing',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart if not direct buy
      if (!directBuy) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      }

      if (paymentMethod === 'cod') {
        toast.success('Your order has been placed with Cash on Delivery!');
      } else {
        toast.success('Payment successful! Your order has been placed.');
      }
      navigate('/shopping/my-bookings');
    } catch (error: any) {
      toast.error('Order failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button onClick={() => navigate('/shopping')}>Continue Shopping</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {/* Cash on Delivery Option */}
                  <div 
                    className={`flex items-center space-x-3 mb-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'cod' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <Banknote className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </Label>
                    {paymentMethod === 'cod' && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* UPI Payment Option */}
                  <div 
                    className={`flex flex-col space-y-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'upi' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">UPI Payment</p>
                          <p className="text-sm text-muted-foreground">Pay using GPay, PhonePe, Paytm, etc.</p>
                        </div>
                      </Label>
                      {paymentMethod === 'upi' && (
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    
                    {/* UPI ID Input */}
                    {showUpiInput && (
                      <div className="ml-10 mt-3 space-y-2">
                        <Label htmlFor="upi-id" className="text-sm font-medium">
                          Enter your UPI ID
                        </Label>
                        <Input
                          id="upi-id"
                          type="text"
                          placeholder="yourname@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="max-w-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <p className="text-xs text-muted-foreground">
                          Example: yourname@okaxis, yourname@ybl, yourname@paytm
                        </p>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Price Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>

                {/* Payment Method Summary */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Payment Method:</p>
                  <p className="font-medium flex items-center gap-2">
                    {paymentMethod === 'cod' ? (
                      <>
                        <Banknote className="h-4 w-4 text-amber-600" />
                        Cash on Delivery
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4 text-green-600" />
                        UPI Payment
                      </>
                    )}
                  </p>
                </div>

                <Button
                  onClick={handleConfirmOrder}
                  className="w-full"
                  disabled={processing || (paymentMethod === 'upi' && !upiId)}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentMethod === 'upi' ? 'Processing Payment...' : 'Placing Order...'}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
