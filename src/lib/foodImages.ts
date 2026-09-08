import type { MenuItem } from '@/types';

// Every current menu item has its own stable, food-only photo. Database
// image_url is intentionally ignored because the old records were wrong.
const ITEM_IMAGES: Record<string, string> = {
  'veg one burger': 'https://images.pexels.com/photos/20722041/pexels-photo-20722041.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'chicken patty burger': 'https://images.pexels.com/photos/19737927/pexels-photo-19737927.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'blaze chick one burger': 'https://images.pexels.com/photos/15076692/pexels-photo-15076692.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'crispy chicken burger': 'https://images.pexels.com/photos/7963093/pexels-photo-7963093.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'chicken tandoori cheese burger': 'https://images.pexels.com/photos/15523385/pexels-photo-15523385.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'mexican cheese burger': 'https://images.pexels.com/photos/6896009/pexels-photo-6896009.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'all cheese chicken burger': 'https://images.pexels.com/photos/3219547/pexels-photo-3219547.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'blaze veg one burger': 'https://images.pexels.com/photos/20722039/pexels-photo-20722039.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'chick one burger': 'https://images.pexels.com/photos/20722036/pexels-photo-20722036.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',

  'chicken strip': 'https://images.pexels.com/photos/8228462/pexels-photo-8228462.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '4 pc fried chicken': 'https://images.pexels.com/photos/1860202/pexels-photo-1860202.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '6 pc fried chicken': 'https://images.pexels.com/photos/60616/pexels-photo-60616.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '2 pc fried chicken': 'https://images.pexels.com/photos/8973352/pexels-photo-8973352.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',

  'classic chicken wrap': 'https://images.pexels.com/photos/13292629/pexels-photo-13292629.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'tandoori chicken wrap': 'https://images.pexels.com/photos/15913640/pexels-photo-15913640.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'falafel chicken wrap': 'https://images.pexels.com/photos/5175621/pexels-photo-5175621.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'falafel wrap': 'https://images.pexels.com/photos/13778655/pexels-photo-13778655.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'cheese chicken wrap': 'https://images.pexels.com/photos/29306507/pexels-photo-29306507.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',

  'cheesy fries': 'https://images.pexels.com/photos/17035142/pexels-photo-17035142.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'loaded fries [fried chicken]': 'https://images.pexels.com/photos/2349992/pexels-photo-2349992.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'french fries': 'https://images.pexels.com/photos/4109234/pexels-photo-4109234.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'large fries': 'https://images.pexels.com/photos/8302768/pexels-photo-8302768.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',

  'chicken pop corn': 'https://images.pexels.com/photos/8998354/pexels-photo-8998354.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'large chicken popcorn': 'https://images.pexels.com/photos/12178045/pexels-photo-12178045.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'fried prawns': 'https://images.pexels.com/photos/6426095/pexels-photo-6426095.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'fried wings': 'https://images.pexels.com/photos/8862753/pexels-photo-8862753.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',

  'cold coffee': 'https://images.pexels.com/photos/13759884/pexels-photo-13759884.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'mango shake': 'https://images.pexels.com/photos/8211179/pexels-photo-8211179.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'biscoff shake': 'https://images.pexels.com/photos/11381485/pexels-photo-11381485.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',

  '10 pc fried wings': 'https://images.pexels.com/photos/27605381/pexels-photo-27605381.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '9 pc strips bucket': 'https://images.pexels.com/photos/15682894/pexels-photo-15682894.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'popcorn bucket': 'https://images.pexels.com/photos/18188572/pexels-photo-18188572.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '6 piece strips + 2 crispy chicken burger': 'https://images.pexels.com/photos/12339076/pexels-photo-12339076.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '6 piece fried wings + 6 piece strips': 'https://images.pexels.com/photos/14661492/pexels-photo-14661492.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '2 piece fried wings + 2 piece strips + mexican chicken burger': 'https://images.pexels.com/photos/10813356/pexels-photo-10813356.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'crispy chicken burger + cheesy chicken wrap + regular fries': 'https://images.pexels.com/photos/19798788/pexels-photo-19798788.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'crispy chicken burger + regular chicken popcorn': 'https://images.pexels.com/photos/35628174/pexels-photo-35628174.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'chick one burger + regular chicken popcorn': 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '6 piece fried prawns + regular chicken popcorn': 'https://images.pexels.com/photos/16273763/pexels-photo-16273763.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  '2 crispy chicken burger + regular chicken popcorn': 'https://images.pexels.com/photos/17121400/pexels-photo-17121400.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
};

const CATEGORY_IMAGES: Record<string, string> = {
  burgers: 'https://images.pexels.com/photos/20722041/pexels-photo-20722041.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'fried-chicken': 'https://images.pexels.com/photos/1860202/pexels-photo-1860202.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  wraps: 'https://images.pexels.com/photos/13292629/pexels-photo-13292629.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  fries: 'https://images.pexels.com/photos/4109234/pexels-photo-4109234.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  'pop-corn': 'https://images.pexels.com/photos/8228462/pexels-photo-8228462.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  prawns: 'https://images.pexels.com/photos/6426095/pexels-photo-6426095.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  wings: 'https://images.pexels.com/photos/8862753/pexels-photo-8862753.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
  drinks: 'https://images.pexels.com/photos/13759884/pexels-photo-13759884.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90',
};

const GENERIC_FALLBACK = 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=2400&q=90';

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getFoodImage(item: Partial<MenuItem> & { category?: { slug?: string } | null }) {
  const byName = ITEM_IMAGES[normalize(item.name || '')];
  if (byName) return byName;
  return CATEGORY_IMAGES[item.category?.slug || ''] || GENERIC_FALLBACK;
}
