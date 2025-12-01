import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShoppingBag, Calendar, Star, Trash2, Eye, Search, Filter, MessageSquare, Package, Truck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    category: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

const MyShoppingBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; orderId: string; productId: string; productName: string }>({ open: false, orderId: '', productId: '', productName: '' });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchReviews();
    }
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const reviewMap: Record<string, Review> = {};
      data?.forEach(review => {
        reviewMap[`${review.order_id}-${review.product_id}`] = review;
      });
      setReviews(reviewMap);
    } catch (error: any) {
      console.error('Failed to load reviews:', error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_items.some(item =>
          item.products.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_status === paymentFilter);
    }

    setFilteredOrders(filtered);
  };

  const cancelOrder = async (orderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchOrders();
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error('Failed to cancel order');
    }
  };

  const submitReview = async () => {
    if (!user) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: reviewDialog.productId,
          order_id: reviewDialog.orderId,
          rating: reviewRating,
          review_text: reviewText || null,
        });

      if (error) throw error;

      await fetchReviews();
      toast.success('Review submitted successfully');
      setReviewDialog({ open: false, orderId: '', productId: '', productName: '' });
      setReviewRating(5);
      setReviewText('');
    } catch (error: any) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-yellow-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = ['processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    
    return steps.map((step, index) => ({
      name: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                My Shopping Orders
              </h1>
              <p className="text-muted-foreground">
                View and manage your shopping purchases
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/shopping')}>
              Continue Shopping
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPaymentFilter('all');
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {orders.length === 0 
                    ? 'Start shopping to see your orders here'
                    : 'Try adjusting your filters to see more orders'}
                </p>
                <Button onClick={() => navigate('/shopping')}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="shadow-card hover:shadow-hover transition-shadow">
                  <CardHeader className="border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-4">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                          <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                            {order.payment_status}
                          </Badge>
                        </CardTitle>
                        
                        {/* Order Status Timeline */}
                        {order.status !== 'cancelled' && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between relative">
                              {getStatusSteps(order.status).map((step, index) => (
                                <div key={step.name} className="flex flex-col items-center flex-1 relative">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    step.completed ? getStatusColor(order.status) : 'bg-muted'
                                  } text-white mb-2 z-10`}>
                                    {step.completed && getStatusIcon(step.name.toLowerCase())}
                                  </div>
                                  <span className={`text-xs ${step.active ? 'font-semibold' : 'text-muted-foreground'}`}>
                                    {step.name}
                                  </span>
                                  {index < getStatusSteps(order.status).length - 1 && (
                                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                                      step.completed ? getStatusColor(order.status) : 'bg-muted'
                                    }`} style={{ zIndex: 0 }} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.status === 'cancelled' && (
                          <Badge variant="destructive" className="mb-2">
                            Order Cancelled
                          </Badge>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <Badge variant="outline">
                            {order.payment_method.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.products.name}</h4>
                            <Badge className="mb-2">{item.products.category}</Badge>
                            
                            {/* Show existing review or add review button */}
                            {reviews[`${order.id}-${item.products.id}`] ? (
                              <div className="mb-2">
                                <div className="flex items-center gap-1 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < reviews[`${order.id}-${item.products.id}`].rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-muted'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    Your Review
                                  </span>
                                </div>
                                {reviews[`${order.id}-${item.products.id}`].review_text && (
                                  <p className="text-xs text-muted-foreground italic">
                                    "{reviews[`${order.id}-${item.products.id}`].review_text}"
                                  </p>
                                )}
                              </div>
                            ) : order.status === 'delivered' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReviewDialog({
                                  open: true,
                                  orderId: order.id,
                                  productId: item.products.id,
                                  productName: item.products.name
                                })}
                                className="mb-2"
                              >
                                <MessageSquare className="mr-1 h-3 w-3" />
                                Write Review
                              </Button>
                            ) : null}
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.products.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          if (order.order_items.length > 0) {
                            navigate(`/products/${order.order_items[0].products.id}`);
                          }
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex-1">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Order
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this order? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Order</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancelOrder(order.id)}>
                                Cancel Order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {reviewDialog.productName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setReviewRating(rating)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating <= reviewRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="review">Your Review (Optional)</Label>
              <Textarea
                id="review"
                placeholder="Tell others about your experience with this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog({ open: false, orderId: '', productId: '', productName: '' })}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={submittingReview}>
              {submittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyShoppingBookings;
