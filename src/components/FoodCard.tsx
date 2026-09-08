import { Plus, Star } from 'lucide-react';
import type { MenuItem } from '@/types';
import { formatPrice } from '@/lib/format';
import { getFoodImage } from '@/lib/foodImages';

export function FoodCard({ item, onAdd, onQuickAdd, onClick }: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onQuickAdd?: (item: MenuItem) => void;
  onClick?: (item: MenuItem) => void;
}) {
  return (
    <div
      className="card card-hover group cursor-pointer"
      onClick={() => onClick?.(item)}
    >
      <div className="relative h-40 sm:h-44 overflow-hidden">
        <img
          src={getFoodImage(item)}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1';
              img.src = 'https://loremflickr.com/800/800/food?lock=99';
            }
          }}
        />
        {item.is_bestseller && (
          <span className="absolute top-2 left-2 badge bg-lsd-blue text-white">
            <Star className="w-2.5 h-2.5 fill-current" />
            Bestseller
          </span>
        )}
        <span className={`absolute top-2 right-2 veg-dot ${item.is_veg ? 'veg-dot-veg' : 'veg-dot-nonveg'}`} />
        {!item.is_available && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-sm font-bold text-lsd-gray-500 uppercase tracking-wide">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-3.5 space-y-2">
        <h3 className="font-bold text-sm text-lsd-gray-900 leading-tight line-clamp-1">{item.name}</h3>
        <p className="text-xs text-lsd-gray-500 line-clamp-2 leading-relaxed min-h-[2rem]">{item.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-lsd-blue">{formatPrice(item.price)}</span>
          {item.is_available && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd ? onQuickAdd(item) : onAdd(item);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-lsd-blue-lightest text-lsd-blue text-xs font-bold uppercase tracking-wide hover:bg-lsd-blue hover:text-white transition-all active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
