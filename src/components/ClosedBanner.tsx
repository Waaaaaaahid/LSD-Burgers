import { MoonStar } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';

export function ClosedBanner() {
  const { settings } = useRestaurant();
  if (!settings || settings.is_open) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center">
      <p className="text-sm text-lsd-error flex items-center justify-center gap-2 font-medium">
        <MoonStar className="w-4 h-4" />
        LSD is currently closed. You can browse the menu but orders won't be accepted right now.
      </p>
    </div>
  );
}
