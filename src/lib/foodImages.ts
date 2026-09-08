import type { MenuItem } from '@/types';

// Each menu item gets its own food-focused image. We intentionally do not use
// the old database image_url here because those records currently contain the
// same unrelated photo for multiple items.
const ITEM_IMAGES: Record<string, string> = {
  'veg one burger': 'https://loremflickr.com/2400/2400/vegburger?lock=101',
  'chicken patty burger': 'https://loremflickr.com/2400/2400/chickenburger?lock=102',
  'blaze chick one burger': 'https://loremflickr.com/2400/2400/spicychickenburger?lock=103',
  'crispy chicken burger': 'https://loremflickr.com/2400/2400/crispychickenburger?lock=104',
  'chicken tandoori cheese burger': 'https://loremflickr.com/2400/2400/tandoorichickenburger?lock=105',
  'mexican cheese burger': 'https://loremflickr.com/2400/2400/mexicanburger?lock=106',
  'all cheese chicken burger': 'https://loremflickr.com/2400/2400/cheesechickenburger?lock=107',
  'blaze veg one burger': 'https://loremflickr.com/2400/2400/vegburger?lock=108',
  'chick one burger': 'https://loremflickr.com/2400/2400/chickenburger?lock=109',

  'chicken strip': 'https://loremflickr.com/2400/2400/chickenstrips?lock=110',
  '4 pc fried chicken': 'https://loremflickr.com/2400/2400/friedchicken?lock=111',
  '6 pc fried chicken': 'https://loremflickr.com/2400/2400/friedchickenbucket?lock=112',
  '2 pc fried chicken': 'https://loremflickr.com/2400/2400/friedchicken?lock=113',

  'classic chicken wrap': 'https://loremflickr.com/2400/2400/chickenwrap?lock=114',
  'tandoori chicken wrap': 'https://loremflickr.com/2400/2400/tandooriwrap?lock=115',
  'falafel chicken wrap': 'https://loremflickr.com/2400/2400/falafelchickenwrap?lock=116',
  'falafel wrap': 'https://loremflickr.com/2400/2400/falafelwrap?lock=117',
  'cheese chicken wrap': 'https://loremflickr.com/2400/2400/cheesechickenwrap?lock=118',

  'cheesy fries': 'https://loremflickr.com/2400/2400/cheesefries?lock=119',
  'loaded fries [fried chicken]': 'https://loremflickr.com/2400/2400/loadedfrieschicken?lock=120',
  'french fries': 'https://loremflickr.com/2400/2400/frenchfries?lock=121',
  'large fries': 'https://loremflickr.com/2400/2400/frenchfries?lock=122',

  'chicken pop corn': 'https://loremflickr.com/2400/2400/chickenpopcorn?lock=123',
  'large chicken popcorn': 'https://loremflickr.com/2400/2400/chickenpopcorn?lock=124',
  'fried prawns': 'https://loremflickr.com/2400/2400/friedprawns?lock=125',
  'fried wings': 'https://loremflickr.com/2400/2400/chickenwings?lock=126',

  'cold coffee': 'https://loremflickr.com/2400/2400/icedcoffee?lock=127',
  'mango shake': 'https://loremflickr.com/2400/2400/mangoshake?lock=128',
  'biscoff shake': 'https://loremflickr.com/2400/2400/biscoffshake?lock=129',

  '10 pc fried wings': 'https://loremflickr.com/2400/2400/chickenwingsbucket?lock=130',
  '9 pc strips bucket': 'https://loremflickr.com/2400/2400/chickenstripsbucket?lock=131',
  'popcorn bucket': 'https://loremflickr.com/2400/2400/chickenpopcornbucket?lock=132',

  '6 piece strips + 2 crispy chicken burger': 'https://loremflickr.com/2400/2400/chickenburgerchickenstrips?lock=133',
  '6 piece fried wings + 6 piece strips': 'https://loremflickr.com/2400/2400/chickenwingschickenstrips?lock=134',

  '2 piece fried wings + 2 piece strips + mexican chicken burger': 'https://loremflickr.com/2400/2400/chickenburgerwingsstrips?lock=135',
  'crispy chicken burger + cheesy chicken wrap + regular fries': 'https://loremflickr.com/2400/2400/burgerwrapfries?lock=136',
  'crispy chicken burger + regular chicken popcorn': 'https://loremflickr.com/2400/2400/burgerchickenpopcorn?lock=137',
  'chick one burger + regular chicken popcorn': 'https://loremflickr.com/2400/2400/chickenburgerpopcorn?lock=138',
  '6 piece fried prawns + regular chicken popcorn': 'https://loremflickr.com/2400/2400/prawnspopcorn?lock=139',
  '2 crispy chicken burger + regular chicken popcorn': 'https://loremflickr.com/2400/2400/doublechickenburgerpopcorn?lock=140',
};

const CATEGORY_IMAGES: Record<string, string> = {
  burgers: 'https://loremflickr.com/2400/2400/burger?lock=201',
  'fried-chicken': 'https://loremflickr.com/2400/2400/friedchicken?lock=202',
  wraps: 'https://loremflickr.com/2400/2400/chickenwrap?lock=203',
  fries: 'https://loremflickr.com/2400/2400/frenchfries?lock=204',
  'pop-corn': 'https://loremflickr.com/2400/2400/chickenpopcorn?lock=205',
  prawns: 'https://loremflickr.com/2400/2400/prawns?lock=206',
  wings: 'https://loremflickr.com/2400/2400/chickenwings?lock=207',
  drinks: 'https://loremflickr.com/2400/2400/milkshake?lock=208',
  'value-bucket-meals': 'https://loremflickr.com/2400/2400/chickenbucket?lock=209',
  'bucket-combos': 'https://loremflickr.com/2400/2400/chickencombo?lock=210',
  'value-meal': 'https://loremflickr.com/2400/2400/chickenmeal?lock=211',
  'value-combo': 'https://loremflickr.com/2400/2400/burgerfries?lock=212',
};

const GENERIC_FALLBACK = 'https://loremflickr.com/2400/2400/food?lock=299';

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getFoodImage(item: Partial<MenuItem> & { category?: { slug?: string } | null }) {
  const byName = ITEM_IMAGES[normalize(item.name || '')];
  if (byName) return byName;
  return CATEGORY_IMAGES[item.category?.slug || ''] || GENERIC_FALLBACK;
}
