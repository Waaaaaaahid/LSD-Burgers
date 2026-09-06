import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle2, ChefHat, Bike, PackageCheck, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'placed', label: 'Order Placed', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready', icon: PackageCheck },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  placed: 'text-lsd-blue bg-lsd-blue-lightest',
  confirmed: 'text-cyan-600 bg-cyan-50',
  preparing: 'text-orange-600 bg-orange-50',
  ready: 'text-purple-600 bg-purple-50',
  out_for_delivery: 'text-lsd-accent bg-orange-50',
  delivered: 'text-lsd-success bg-green-50',
  cancelled: 'text-lsd-error bg-red-50',
};

export function Orders() {
  const { session } = useAuth();
  const { show } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) {
        show('Failed to load orders', 'error');
      } else {
        setOrders(data as Order[]);
      }
      setLoading(false);
    })();
  }, [session, show]);

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 px-4">
        <Package className="w-16 h-16 text-lsd-gray-300" />
        <p className="text-lsd-gray-500">Please sign in to view your orders.</p>
        <Link to="/auth" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-6 w-1/3 mb-3" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-lsd-gray-100 border border-lsd-gray-200 flex items-center justify-center">
          <Package className="w-10 h-10 text-lsd-gray-300" />
        </div>
        <p className="text-lsd-gray-500 text-center">No orders yet.<br />Time to get something dope!</p>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <h1 className="font-display text-4xl tracking-tight text-lsd-gray-900 mb-6">My Orders</h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          const currentStepIndex = order.status === 'cancelled' ? -1 : STATUS_STEPS.findIndex(s => s.status === order.status);
          const isCancelled = order.status === 'cancelled';

          return (
            <div key={order.id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-lsd-gray-50 transition-colors"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lsd-gray-900 text-sm">{order.order_number}</span>
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-lsd-gray-400">{formatDate(order.created_at)} \u00B7 {formatPrice(order.total)}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-lsd-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <div className="border-t border-lsd-gray-200 p-4 space-y-4 animate-fade-in">
                  {/* Tracking */}
                  {!isCancelled ? (
                    <div className="flex items-center justify-between">
                      {STATUS_STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const isCompleted = i <= currentStepIndex;
                        const isCurrent = i === currentStepIndex;
                        return (
                          <div key={step.status} className="flex flex-col items-center gap-1 flex-1 relative">
                            {i > 0 && (
                              <div className={`absolute top-5 left-[-50%] w-full h-0.5 ${i <= currentStepIndex ? 'bg-lsd-blue' : 'bg-lsd-gray-200'}`} />
                            )}
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCompleted ? 'bg-lsd-blue text-white' : 'bg-lsd-gray-100 border border-lsd-gray-200 text-lsd-gray-400'
                            } ${isCurrent ? 'ring-4 ring-lsd-blue-lightest animate-float' : ''}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] text-center leading-tight ${isCompleted ? 'text-lsd-blue font-semibold' : 'text-lsd-gray-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                      <XCircle className="w-5 h-5 text-lsd-error" />
                      <p className="text-sm text-lsd-error">This order was cancelled.</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    {order.order_items?.map((oi) => (
                      <div key={oi.id} className="flex items-center gap-3 text-sm">
                        <img src={oi.image_url} alt={oi.name} className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                        <span className="text-lsd-gray-600 flex-1">{oi.quantity}x {oi.name}</span>
                        <span className="text-lsd-gray-900 font-medium">{formatPrice(oi.item_total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery info */}
                  <div className="text-sm text-lsd-gray-500 space-y-1">
                    <p><span className="text-lsd-gray-400">Type:</span> {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                    {order.delivery_type === 'delivery' && order.address && (
                      <p><span className="text-lsd-gray-400">Address:</span> {order.address}{order.address_details ? `, ${order.address_details}` : ''}</p>
                    )}
                    {order.notes && <p><span className="text-lsd-gray-400">Notes:</span> {order.notes}</p>}
                    <p><span className="text-lsd-gray-400">Payment:</span> {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
                  </div>

                  <div className="border-t border-lsd-gray-200 pt-3 flex justify-between font-bold text-lsd-gray-900">
                    <span>Total</span>
                    <span className="text-lsd-blue">{formatPrice(order.total)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
