import type { MenuItem } from '@/types';

const FALLBACK_IMAGES: Record<string, string> = {
  burgers: 'https://loremflickr.com/800/800/burger?lock=11',
  'fried-chicken': 'https://loremflickr.com/800/800/friedchicken?lock=12',
  wraps: 'https://loremflickr.com/800/800/chickenwrap?lock=13',
  fries: 'https://loremflickr.com/800/800/frenchfries?lock=14',
  'pop-corn': 'https://loremflickr.com/800/800/chickenpopcorn?lock=15',
  prawns: 'https://loremflickr.com/800/800/prawns?lock=16',
  wings: 'https://loremflickr.com/800/800/chickenwings?lock=17',
  drinks: 'https://loremflickr.com/800/800/milkshake?lock=18',
  'value-bucket-meals': 'https://loremflickr.com/800/800/friedchickenbucket?lock=19',
  'bucket-combos': 'https://loremflickr.com/800/800/chickenburger?lock=20',
  'value-meal': 'https://loremflickr.com/800/800/chickenmeal?lock=21',
  'value-combo': 'https://loremflickr.com/800/800/burgerfries?lock=22',
};

const GENERIC_FALLBACK = 'https://loremflickr.com/800/800/food?lock=99';

export function getFoodImage(item: Partial<MenuItem> & { category?: { slug?: string } | null }) {
  if (item.image_url?.trim()) return item.image_url;
  return FALLBACK_IMAGES[item.category?.slug || ''] || GENERIC_FALLBACK;
}
