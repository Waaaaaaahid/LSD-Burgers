import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRestaurant } from '@/context/RestaurantContext';
import { formatPrice } from '@/lib/format';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const { settings } = useRestaurant();
  const navigate = useNavigate();

  const deliveryCharge = subtotal >= (settings?.min_order_amount ?? 99) && subtotal > 0 ? (settings?.delivery_charge ?? 30) : 0;
  const total = subtotal + deliveryCharge;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div className="absolute inset-0 bg-lsd-gray-900/40 backdrop-blur-sm animate-fade-in" />
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-lsd-gray-200 flex flex-col animate-slide-in-right shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-lsd-gray-200 bg-lsd-blue-lightest">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-lsd-blue" />
            <h2 className="font-display text-xl tracking-tight text-lsd-gray-900">Your Cart ({totalItems})</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white transition-colors">
            <X className="w-5 h-5 text-lsd-gray-600" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-20 h-20 rounded-full bg-lsd-gray-100 border border-lsd-gray-200 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-lsd-gray-300" />
            </div>
            <p className="text-lsd-gray-500 text-center">Your cart is empty.<br />Add something dope!</p>
            <button onClick={() => { onClose(); navigate('/menu'); }} className="btn-primary">
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-lsd-gray-50">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-white border border-lsd-gray-200 shadow-card">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-lsd-gray-900 truncate">{item.name}</h3>
                    {item.customizations.length > 0 && item.customizations.some(g => g.options.length > 0) && (
                      <p className="text-xs text-lsd-gray-400 mt-0.5 truncate">
                        {item.customizations.filter(g => g.options.length > 0).map(g =>
                          g.options.map(o => o.name).join(', ')
                        ).join(', ')}
                      </p>
                    )}
                    <p className="text-lsd-blue font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 bg-lsd-gray-100 rounded-xl border border-lsd-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 rounded-lg hover:bg-white transition-colors"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-lsd-error" /> : <Minus className="w-3.5 h-3.5 text-lsd-gray-600" />}
                        </button>
                        <span className="px-2 text-sm font-semibold min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 rounded-lg hover:bg-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-lsd-blue" />
                        </button>
                      </div>
                      <span className="text-sm font-bold ml-auto text-lsd-gray-900">{formatPrice(item.item_total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-lsd-gray-200 p-4 space-y-3 safe-bottom bg-white">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-lsd-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {deliveryCharge > 0 && (
                  <div className="flex justify-between text-sm text-lsd-gray-500">
                    <span>Delivery</span>
                    <span>{formatPrice(deliveryCharge)}</span>
                  </div>
                )}
                {subtotal > 0 && subtotal < (settings?.min_order_amount ?? 99) && (
                  <p className="text-xs text-lsd-accent font-medium">
                    Add {formatPrice((settings?.min_order_amount ?? 99) - subtotal)} more for delivery
                  </p>
                )}
                <div className="flex justify-between font-bold text-base pt-1 text-lsd-gray-900">
                  <span>Total</span>
                  <span className="text-lsd-blue">{formatPrice(total)}</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full">
                Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
