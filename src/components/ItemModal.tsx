import { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import type { MenuItem, CustomizationGroup } from '@/types';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const { addItem } = useCart();
  const { show } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationGroup[]>([]);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedCustomizations(
        (item.customizations || []).map((g) => ({ ...g, options: [] }))
      );
    }
  }, [item]);

  if (!item) return null;

  const customizationPrice = selectedCustomizations.reduce((sum, g) => {
    return sum + g.options.reduce((s, o) => s + o.price, 0);
  }, 0);
  const total = (item.price + customizationPrice) * quantity;

  const toggleOption = (groupIndex: number, optionName: string, optionPrice: number) => {
    setSelectedCustomizations((prev) => {
      const updated = [...prev];
      const group = updated[groupIndex];
      if (group.type === 'single') {
        updated[groupIndex] = { ...group, options: [{ name: optionName, price: optionPrice }] };
      } else {
        const exists = group.options.find((o) => o.name === optionName);
        if (exists) {
          updated[groupIndex] = { ...group, options: group.options.filter((o) => o.name !== optionName) };
        } else {
          updated[groupIndex] = { ...group, options: [...group.options, { name: optionName, price: optionPrice }] };
        }
      }
      return updated;
    });
  };

  const handleAdd = () => {
    addItem(item, quantity, selectedCustomizations);
    show(`${item.name} added to cart`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-lsd-gray-900/50 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-lsd-gray-200 max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors">
          <X className="w-5 h-5 text-lsd-gray-700" />
        </button>

        <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-3xl">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          {item.is_bestseller && (
            <span className="absolute top-3 left-3 badge bg-lsd-blue text-white">
              Bestseller
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`veg-dot ${item.is_veg ? 'veg-dot-veg' : 'veg-dot-nonveg'}`} />
              <span className="text-xs text-lsd-gray-500 uppercase tracking-wide font-semibold">{item.is_veg ? 'Veg' : 'Non-Veg'}</span>
            </div>
            <h2 className="font-display text-2xl tracking-tight text-lsd-gray-900">{item.name}</h2>
            <p className="text-sm text-lsd-gray-500 mt-1">{item.description}</p>
            <p className="text-xl font-bold text-lsd-blue mt-2">{formatPrice(item.price)}</p>
          </div>

          {item.customizations && item.customizations.length > 0 && (
            <div className="space-y-4">
              {item.customizations.map((group, gi) => (
                <div key={gi} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-lsd-gray-900">{group.name}</h3>
                    <span className="text-xs text-lsd-gray-400">{group.type === 'single' ? 'Choose 1' : 'Choose any'}</span>
                  </div>
                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const isSelected = selectedCustomizations[gi]?.options.some((o) => o.name === opt.name);
                      return (
                        <button
                          key={opt.name}
                          onClick={() => toggleOption(gi, opt.name, opt.price)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-lsd-blue bg-lsd-blue-lightest'
                              : 'border-lsd-gray-200 bg-white hover:border-lsd-blue-lighter'
                          }`}
                        >
                          <span className="text-sm text-lsd-gray-900 font-medium">{opt.name}</span>
                          <div className="flex items-center gap-2">
                            {opt.price > 0 && <span className="text-sm text-lsd-gray-500">+{formatPrice(opt.price)}</span>}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-lsd-blue bg-lsd-blue' : 'border-lsd-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1 bg-lsd-gray-100 rounded-xl border border-lsd-gray-200 p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 rounded-lg hover:bg-white transition-colors">
                <Minus className="w-4 h-4 text-lsd-gray-600" />
              </button>
              <span className="px-3 font-bold min-w-[40px] text-center text-lsd-gray-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 rounded-lg hover:bg-white transition-colors">
                <Plus className="w-4 h-4 text-lsd-blue" />
              </button>
            </div>
            <button onClick={handleAdd} className="btn-primary flex-1" disabled={!item.is_available}>
              {item.is_available ? `Add to Cart · ${formatPrice(total)}` : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
