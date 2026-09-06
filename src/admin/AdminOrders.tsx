import { useState, useEffect, useCallback } from 'react';
import { Search, Clock, CheckCircle2, ChefHat, Bike, PackageCheck, XCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

const STATUS_FLOW: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  placed: { label: 'Placed', icon: Clock, color: 'text-lsd-blue bg-lsd-blue-lightest' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-cyan-600 bg-cyan-50' },
  preparing: { label: 'Preparing', icon: ChefHat, color: 'text-orange-600 bg-orange-50' },
  ready: { label: 'Ready', icon: PackageCheck, color: 'text-purple-600 bg-purple-50' },
  out_for_delivery: { label: 'Out for Delivery', icon: Bike, color: 'text-lsd-accent bg-orange-50' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-lsd-success bg-green-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-lsd-error bg-red-50' },
};

const NOTIFICATION_MESSAGES: Record<OrderStatus, string> = {
  placed: 'Your LSD order has been placed!',
  confirmed: 'Your LSD order has been confirmed!',
  preparing: 'Your order is being prepared!',
  ready: 'Your order is ready for pickup!',
  out_for_delivery: 'Your order is out for delivery!',
  delivered: 'Your LSD order has been delivered. Enjoy!',
  cancelled: 'Your LSD order has been cancelled.',
};

export function AdminOrders() {
  const { show } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    if (error) {
      show('Failed to update status', 'error');
      return;
    }

    const order = orders.find(o => o.id === orderId);
    if (order) {
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        order_id: orderId,
        message: NOTIFICATION_MESSAGES[status],
        type: 'order_update',
      });
    }

    show(`Order marked as ${status.replace(/_/g, ' ')}`, 'success');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.order_number.toLowerCase().includes(search.toLowerCase()) && !o.customer_name.toLowerCase().includes(search.toLowerCase()) && !o.customer_phone.includes(search)) return false;
    return true;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-lsd-gray-900">Orders</h1>
        <p className="text-sm text-lsd-gray-500">Manage and track all customer orders</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lsd-gray-400" />
        <input
          type="text"
          placeholder="Search by order number, name, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            filter === 'all' ? 'bg-lsd-blue text-white shadow-blue' : 'bg-white border border-lsd-gray-200 text-lsd-gray-600'
          }`}
        >
          All ({orders.length})
        </button>
        {STATUS_FLOW.concat('cancelled').map((status) => {
          const config = STATUS_CONFIG[status];
          const count = statusCounts[status] || 0;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === status ? 'bg-lsd-blue text-white shadow-blue' : 'bg-white border border-lsd-gray-200 text-lsd-gray-600'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lsd-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const config = STATUS_CONFIG[order.status];
            const Icon = config.icon;
            return (
              <div key={order.id} className="card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-lsd-gray-900 text-sm">{order.order_number}</p>
                      <p className="text-xs text-lsd-gray-400">{order.customer_name} \u00B7 {order.customer_phone}</p>
                      <p className="text-xs text-lsd-gray-400">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lsd-blue">{formatPrice(Number(order.total))}</p>
                      <p className="text-xs text-lsd-gray-500">{order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-2 rounded-xl bg-lsd-blue-lightest text-lsd-blue text-sm font-semibold hover:bg-lsd-blue hover:text-white transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-lsd-gray-900/50 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-lsd-gray-200 max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-lsd-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lsd-gray-900">{selectedOrder.order_number}</h2>
                <p className="text-xs text-lsd-gray-400">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-lsd-gray-100">
                <X className="w-5 h-5 text-lsd-gray-600" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Customer Info */}
              <div className="space-y-1 text-sm">
                <p className="text-lsd-gray-600"><span className="text-lsd-gray-400">Customer:</span> {selectedOrder.customer_name}</p>
                <p className="text-lsd-gray-600"><span className="text-lsd-gray-400">Phone:</span> {selectedOrder.customer_phone}</p>
                <p className="text-lsd-gray-600"><span className="text-lsd-gray-400">Type:</span> {selectedOrder.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                {selectedOrder.delivery_type === 'delivery' && selectedOrder.address && (
                  <p className="text-lsd-gray-600"><span className="text-lsd-gray-400">Address:</span> {selectedOrder.address}{selectedOrder.address_details ? `, ${selectedOrder.address_details}` : ''}</p>
                )}
                {selectedOrder.notes && <p className="text-lsd-gray-600"><span className="text-lsd-gray-400">Notes:</span> {selectedOrder.notes}</p>}
                <p className="text-lsd-gray-600"><span className="text-lsd-gray-400">Payment:</span> {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
              </div>

              {/* Items */}
              <div className="space-y-2 border-t border-lsd-gray-200 pt-4">
                {selectedOrder.order_items?.map((oi) => (
                  <div key={oi.id} className="flex items-center gap-3 text-sm">
                    <img src={oi.image_url} alt={oi.name} className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                    <span className="text-lsd-gray-600 flex-1">{oi.quantity}x {oi.name}</span>
                    <span className="text-lsd-gray-900 font-medium">{formatPrice(oi.item_total)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-lsd-gray-200 pt-3 flex justify-between font-bold text-lsd-gray-900">
                <span>Total</span>
                <span className="text-lsd-blue">{formatPrice(Number(selectedOrder.total))}</span>
              </div>

              {/* Status Actions */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="border-t border-lsd-gray-200 pt-4 space-y-2">
                  <p className="text-sm font-bold text-lsd-gray-900">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_FLOW.map((status) => {
                      const config = STATUS_CONFIG[status];
                      const Icon = config.icon;
                      const isCurrent = selectedOrder.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedOrder.id, status)}
                          disabled={isCurrent}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isCurrent
                              ? 'bg-lsd-blue text-white'
                              : 'bg-lsd-gray-50 border border-lsd-gray-200 text-lsd-gray-600 hover:border-lsd-blue-lighter hover:text-lsd-blue'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-lsd-error bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
