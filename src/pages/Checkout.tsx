import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User as UserIcon, Home as HomeIcon, Store, CreditCard, Banknote, StickyNote, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber } from '@/lib/format';
import type { OrderStatus } from '@/types';

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { profile, session } = useAuth();
  const { settings } = useRestaurant();
  const { show } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const deliveryCharge = deliveryType === 'delivery' && subtotal >= (settings?.min_order_amount ?? 99) ? (settings?.delivery_charge ?? 30) : 0;
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      show('Please sign in to place an order', 'error');
      navigate('/auth');
      return;
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      show('Please enter your delivery address', 'error');
      return;
    }
    if (!settings?.is_open) {
      show('LSD is currently closed. Please try again later.', 'error');
      return;
    }

    setPlacing(true);
    const orderNumber = generateOrderNumber();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        order_number: orderNumber,
        status: 'placed' as OrderStatus,
        subtotal,
        delivery_charge: deliveryCharge,
        discount: 0,
        total,
        customer_name: name,
        customer_phone: phone,
        delivery_type: deliveryType,
        address: deliveryType === 'delivery' ? address : '',
        address_details: deliveryType === 'delivery' ? addressDetails : '',
        notes,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      show('Failed to place order. Please try again.', 'error');
      setPlacing(false);
      return;
    }

    const orderItems = items.map((ci) => ({
      order_id: orderData.id,
      menu_item_id: ci.menu_item_id,
      name: ci.name,
      image_url: ci.image_url,
      price: ci.price,
      quantity: ci.quantity,
      customizations: ci.customizations,
      item_total: ci.item_total,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      show('Order placed but items failed to save. Contact support.', 'error');
      setPlacing(false);
      return;
    }

    clearCart();
    setSuccess(orderNumber);
    setPlacing(false);
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 animate-fade-in bg-grid">
        <div className="text-center max-w-md space-y-5">
          <div className="w-24 h-24 rounded-full bg-lsd-blue-lightest border-2 border-lsd-blue flex items-center justify-center mx-auto animate-bounce-in">
            <CheckCircle2 className="w-12 h-12 text-lsd-blue" />
          </div>
          <h1 className="font-display text-4xl tracking-tight text-lsd-gray-900">Order Placed!</h1>
          <p className="text-lsd-gray-500">Your order <span className="text-lsd-blue font-bold">{success}</span> has been placed successfully. We'll start preparing it right away!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="btn-primary">Track My Order</button>
            <button onClick={() => navigate('/menu')} className="btn-secondary">Order More</button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-lsd-gray-500 text-lg">Your cart is empty.</p>
        <button onClick={() => navigate('/menu')} className="btn-primary">Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="font-display text-4xl tracking-tight text-lsd-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="space-y-5">
        {/* Contact Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue">Contact Information</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lsd-gray-400" />
              <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="input-field pl-10" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lsd-gray-400" />
              <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-field pl-10" />
            </div>
          </div>
        </div>

        {/* Delivery Type */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue">Delivery Method</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                deliveryType === 'delivery'
                  ? 'border-lsd-blue bg-lsd-blue-lightest'
                  : 'border-lsd-gray-200 bg-white hover:border-lsd-blue-lighter'
              }`}
            >
              <HomeIcon className={`w-5 h-5 ${deliveryType === 'delivery' ? 'text-lsd-blue' : 'text-lsd-gray-400'}`} />
              <div className="text-left">
                <p className="font-semibold text-sm text-lsd-gray-900">Delivery</p>
                <p className="text-xs text-lsd-gray-500">Get it at home</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('pickup')}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                deliveryType === 'pickup'
                  ? 'border-lsd-blue bg-lsd-blue-lightest'
                  : 'border-lsd-gray-200 bg-white hover:border-lsd-blue-lighter'
              }`}
            >
              <Store className={`w-5 h-5 ${deliveryType === 'pickup' ? 'text-lsd-blue' : 'text-lsd-gray-400'}`} />
              <div className="text-left">
                <p className="font-semibold text-sm text-lsd-gray-900">Pickup</p>
                <p className="text-xs text-lsd-gray-500">Collect from store</p>
              </div>
            </button>
          </div>
        </div>

        {/* Address (delivery only) */}
        {deliveryType === 'delivery' && (
          <div className="card p-5 space-y-4 animate-fade-in">
            <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue">Delivery Address</h2>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-lsd-gray-400" />
              <textarea
                placeholder="House no, street, area, landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={2}
                className="input-field pl-10 resize-none"
              />
            </div>
            <input
              type="text"
              placeholder="Flat / Floor / Building (optional)"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              className="input-field"
            />
          </div>
        )}

        {/* Payment Method */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === 'cod'
                  ? 'border-lsd-blue bg-lsd-blue-lightest'
                  : 'border-lsd-gray-200 bg-white hover:border-lsd-blue-lighter'
              }`}
            >
              <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-lsd-blue' : 'text-lsd-gray-400'}`} />
              <span className="font-semibold text-sm text-lsd-gray-900">Cash on Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === 'online'
                  ? 'border-lsd-blue bg-lsd-blue-lightest'
                  : 'border-lsd-gray-200 bg-white hover:border-lsd-blue-lighter'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${paymentMethod === 'online' ? 'text-lsd-blue' : 'text-lsd-gray-400'}`} />
              <span className="font-semibold text-sm text-lsd-gray-900">Online</span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue">Order Notes</h2>
          <div className="relative">
            <StickyNote className="absolute left-3 top-3 w-4 h-4 text-lsd-gray-400" />
            <textarea
              placeholder="Any special instructions? (e.g., extra spicy, no onions)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field pl-10 resize-none"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-lsd-gray-600">{item.quantity}x {item.name}</span>
                <span className="text-lsd-gray-900 font-medium">{formatPrice(item.item_total)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-lsd-gray-200 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-lsd-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {deliveryCharge > 0 && (
              <div className="flex justify-between text-sm text-lsd-gray-500">
                <span>Delivery Charge</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 text-lsd-gray-900">
              <span>Total</span>
              <span className="text-lsd-blue">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={placing} className="btn-primary w-full text-base py-4">
          {placing ? 'Placing Order...' : `Place Order \u00B7 ${formatPrice(total)}`}
        </button>
      </form>
    </div>
  );
}
