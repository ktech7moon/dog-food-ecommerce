import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";
import { Package, ChevronLeft, Eye, ShoppingBag, Clock } from "lucide-react";

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  customizations?: {
    protein: string;
    size: string;
    frequency: string;
  };
  product?: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface Order {
  id: number;
  userId: number;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  createdAt: string;
  items: OrderItem[];
}

const OrderHistory = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });
  
  useEffect(() => {
    if (!user) {
      navigate("/");
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view your orders.",
        duration: 3000,
      });
    }
  }, [user, navigate, toast]);
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500">Shipped</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };
  
  const renderOrderItems = (items: OrderItem[]) => {
    if (!items || items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-4">No items in this order</TableCell>
        </TableRow>
      );
    }
    
    return items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            {item.product?.imageUrl && (
              <img 
                src={item.product.imageUrl} 
                alt={item.product.name} 
                className="h-12 w-12 rounded object-cover" 
              />
            )}
            <div>
              <p className="font-medium">{item.product?.name || `Product #${item.productId}`}</p>
              {item.customizations && (
                <div className="text-xs text-gray-500">
                  {item.customizations.protein && <span>Protein: {item.customizations.protein}, </span>}
                  {item.customizations.size && <span>Size: {item.customizations.size}, </span>}
                  {item.customizations.frequency && <span>Delivery: {item.customizations.frequency}</span>}
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">{item.quantity}</TableCell>
        <TableCell>{formatCurrency(item.price)}</TableCell>
        <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
      </TableRow>
    ));
  };
  
  const renderOrderRows = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-9 w-16" /></TableCell>
        </TableRow>
      ));
    }
    
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-red-500">
            Error loading orders. Please try again later.
          </TableCell>
        </TableRow>
      );
    }
    
    if (!orders || orders.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <div className="flex flex-col items-center gap-2">
              <ShoppingBag className="h-12 w-12 text-gray-300" />
              <p>You haven't placed any orders yet.</p>
              <Button 
                className="mt-2" 
                onClick={() => navigate("/")}
              >
                Start Shopping
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }
    
    return orders.map((order: Order) => (
      <TableRow key={order.id}>
        <TableCell>#{order.id}</TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        <TableCell>{getStatusBadge(order.status)}</TableCell>
        <TableCell>{order.items.length}</TableCell>
        <TableCell>{formatCurrency(order.total)}</TableCell>
        <TableCell>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => handleViewOrder(order)}
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Order History | PawsomeMeals</title>
      </Helmet>
      
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-1"
          onClick={() => navigate("/account")}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order History</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Your Orders
          </CardTitle>
          <CardDescription>
            View and track all your previous orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderOrderRows()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder ? formatDate(selectedOrder.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Order Details</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span>{getStatusBadge(selectedOrder.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order Date:</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order #:</span>
                      <span>{selectedOrder.id}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="text-sm">
                    <p>{selectedOrder.shippingAddress}</p>
                    <p>{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZip}</p>
                    <p>{selectedOrder.shippingCountry}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderOrderItems(selectedOrder.items)}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex flex-col gap-2 sm:w-1/2 sm:ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                <Clock className="h-4 w-4" />
                <span>
                  Estimated delivery: 
                  {new Date(selectedOrder.createdAt) > new Date() 
                    ? " Processing" 
                    : " 3-5 business days from order date"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;
