import { useState, useEffect } from 'react';
import { Save, Store, Truck, Clock, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRestaurant } from '@/context/RestaurantContext';
import { useToast } from '@/context/ToastContext';
import type { RestaurantSettings } from '@/types';

export function AdminSettings() {
  const { settings, refresh } = useRestaurant();
  const { show } = useToast();
  const [form, setForm] = useState<RestaurantSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const { error } = await supabase.from('restaurant_settings').update({
      is_open: form.is_open,
      delivery_enabled: form.delivery_enabled,
      pickup_enabled: form.pickup_enabled,
      delivery_charge: form.delivery_charge,
      min_order_amount: form.min_order_amount,
      opening_time: form.opening_time,
      closing_time: form.closing_time,
      phone: form.phone,
      address: form.address,
      name: form.name,
      tagline: form.tagline,
    }).eq('id', 1);
    if (error) {
      show('Failed to save settings', 'error');
    } else {
      await refresh();
      show('Settings saved', 'success');
    }
    setSaving(false);
  };

  if (!form) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-lsd-gray-900">Restaurant Settings</h1>
        <p className="text-sm text-lsd-gray-500">Manage restaurant availability and delivery options</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Availability */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue flex items-center gap-2">
            <Store className="w-4 h-4" /> Availability
          </h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-lsd-gray-900">Restaurant Open</p>
              <p className="text-xs text-lsd-gray-500">Allow customers to place orders</p>
            </div>
            <input
              type="checkbox"
              checked={form.is_open}
              onChange={(e) => setForm({ ...form, is_open: e.target.checked })}
              className="w-5 h-5 accent-lsd-blue"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-lsd-gray-900">Delivery Enabled</p>
              <p className="text-xs text-lsd-gray-500">Allow delivery orders</p>
            </div>
            <input
              type="checkbox"
              checked={form.delivery_enabled}
              onChange={(e) => setForm({ ...form, delivery_enabled: e.target.checked })}
              className="w-5 h-5 accent-lsd-blue"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-lsd-gray-900">Pickup Enabled</p>
              <p className="text-xs text-lsd-gray-500">Allow pickup orders</p>
            </div>
            <input
              type="checkbox"
              checked={form.pickup_enabled}
              onChange={(e) => setForm({ ...form, pickup_enabled: e.target.checked })}
              className="w-5 h-5 accent-lsd-blue"
            />
          </label>
        </div>

        {/* Delivery & Charges */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue flex items-center gap-2">
            <Truck className="w-4 h-4" /> Delivery & Charges
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-lsd-gray-500 mb-1.5 block">Delivery Charge (\u20B9)</label>
              <input
                type="number"
                step="0.01"
                value={form.delivery_charge}
                onChange={(e) => setForm({ ...form, delivery_charge: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-lsd-gray-500 mb-1.5 block">Min Order Amount (\u20B9)</label>
              <input
                type="number"
                step="0.01"
                value={form.min_order_amount}
                onChange={(e) => setForm({ ...form, min_order_amount: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue flex items-center gap-2">
            <Clock className="w-4 h-4" /> Opening Hours
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-lsd-gray-500 mb-1.5 block">Opening Time</label>
              <input
                type="time"
                value={form.opening_time}
                onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-lsd-gray-500 mb-1.5 block">Closing Time</label>
              <input
                type="time"
                value={form.closing_time}
                onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact & Location
          </h2>
          <div>
            <label className="text-xs text-lsd-gray-500 mb-1.5 block">Restaurant Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-lsd-gray-500 mb-1.5 block">Tagline</label>
            <input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-lsd-gray-500 mb-1.5 block">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-lsd-gray-500 mb-1.5 block">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="input-field resize-none" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
