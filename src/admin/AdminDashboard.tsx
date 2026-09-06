import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, Clock, CheckCircle2, XCircle, Star, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRestaurant } from '@/context/RestaurantContext';
import { formatPrice, formatDate } from '@/lib/format';
import type { Order } from '@/types';

export function AdminDashboard() {
  const { settings, refresh } = useRestaurant();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [popularItems, setPopularItems] = useState<{ name: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersRes, popularRes, recentRes] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', today.toISOString()),
        supabase.from('order_items').select('name, quantity'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const todayOrders = (ordersRes.data || []) as Order[];
      const completed = todayOrders.filter(o => o.status === 'delivered');
      const pending = todayOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));
      const cancelled = todayOrders.filter(o => o.status === 'cancelled');
      const revenue = completed.reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue: revenue,
        pending: pending.length,
        completed: completed.length,
        cancelled: cancelled.length,
      });

      const itemMap = new Map<string, number>();
      ((popularRes.data || []) as { name: string; quantity: number }[]).forEach((oi) => {
        itemMap.set(oi.name, (itemMap.get(oi.name) || 0) + oi.quantity);
      });
      setPopularItems(Array.from(itemMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5));

      setRecentOrders((recentRes.data || []) as Order[]);
      setLoading(false);
    })();
  }, []);

  const toggleOpen = async () => {
    if (!settings) return;
    await supabase.from('restaurant_settings').update({ is_open: !settings.is_open }).eq('id', 1);
    await refresh();
  };

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: Package, color: 'text-lsd-blue bg-lsd-blue-lightest' },
    { label: "Today's Revenue", value: formatPrice(stats.todayRevenue), icon: TrendingUp, color: 'text-lsd-success bg-green-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-lsd-success bg-green-50' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-lsd-error bg-red-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-lsd-gray-900">Dashboard</h1>
          <p className="text-sm text-lsd-gray-500">Overview of today's performance</p>
        </div>
        <button
          onClick={toggleOpen}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all border-2 ${
            settings?.is_open
              ? 'bg-green-50 text-lsd-success border-green-200'
              : 'bg-red-50 text-lsd-error border-red-200'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${settings?.is_open ? 'bg-lsd-success' : 'bg-lsd-error'}`} />
          {settings?.is_open ? 'Restaurant Open' : 'Restaurant Closed'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-lsd-gray-900">{stat.value}</p>
              <p className="text-xs text-lsd-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lsd-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-lsd-blue font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-lsd-gray-400 text-center py-8">No orders today yet.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link key={order.id} to="/admin/orders" className="flex items-center justify-between p-3 rounded-xl bg-lsd-gray-50 hover:bg-lsd-blue-lightest transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-lsd-gray-900">{order.order_number}</p>
                    <p className="text-xs text-lsd-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-lsd-blue">{formatPrice(Number(order.total))}</p>
                    <p className="text-xs text-lsd-gray-500 capitalize">{order.status.replace(/_/g, ' ')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popular Items */}
        <div className="card p-5">
          <h2 className="font-bold text-lsd-gray-900 mb-4">Popular Items</h2>
          {popularItems.length === 0 ? (
            <p className="text-sm text-lsd-gray-400 text-center py-8">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {popularItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-lsd-gray-50">
                  <span className="w-6 h-6 rounded-full bg-lsd-blue-lightest text-lsd-blue text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-lsd-gray-900 font-medium flex-1">{item.name}</span>
                  <span className="text-sm font-bold text-lsd-blue">{item.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
