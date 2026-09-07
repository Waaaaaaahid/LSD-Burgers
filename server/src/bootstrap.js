import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI is required');

const categorySchema = new mongoose.Schema({ name:String, slug:{type:String,unique:true}, sort_order:Number, icon:String }, {timestamps:true});
const menuSchema = new mongoose.Schema({ category_id:{type:mongoose.Schema.Types.ObjectId,ref:'Category'}, name:String, description:String, price:Number, image_url:String, is_veg:Boolean, is_bestseller:Boolean, is_available:Boolean, sort_order:Number, customizations:Array }, {timestamps:true});
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuSchema);

const categories = [
  ['Burgers','burgers','🍔'],['Fried Chicken','fried-chicken','🍗'],['Wraps','wraps','🌯'],['Fries','fries','🍟'],['Pop Corn','pop-corn','🍿'],['Prawns','prawns','🍤'],['Wings','wings','🍗'],['Drinks','drinks','🥤'],['Value Bucket Meals','value-bucket-meals','🪣'],['Bucket Combos','bucket-combos','🍗'],['Value Meal','value-meal','🍱'],['Value Combo','value-combo','🍔']
];

const items = [
  ['Burgers','Veg One Burger',79,true,'An indulgent burger stuffed with spicy grilled aloo patty spread on a bed of fresh vegetables.'],
  ['Burgers','Chicken patty burger',89,false,'A soft and filling chicken burger with a juicy patty, perfect for a hearty snack.'],
  ['Burgers','Blaze Chick One Burger',109,false,'A tasty chicken burger perfect for a snack or quick meal.'],
  ['Burgers','Crispy chicken burger',169,false,'A delightfully flavorsome and mouthwatering spicy chicken burger.'],
  ['Burgers','Chicken tandoori cheese burger',199,false,'Crispy chicken burger with tandoori flavour and melted cheese.'],
  ['Burgers','Mexican cheese burger',199,false,'Crispy chicken burger with Mexican-style cheese and sauce.'],
  ['Burgers','All Cheese Chicken Burger',220,false,'Juicy chicken patty loaded with melted cheese, fresh veggies and signature sauce.'],
  ['Burgers','Blaze Veg One Burger',99,true,'Veg patty burger topped with crispy fried onions.'],
  ['Burgers','Chick One Burger',89,false,'Classic chicken burger for a quick, filling bite.'],
  ['Fried Chicken','Chicken strip',178,false,'3 crispy golden-fried chicken strips served with garlic mayo dip.'],
  ['Fried Chicken','4 Pc Fried Chicken',499,false,'4 pc fried chicken served with spicy dip and garlic dip.'],
  ['Fried Chicken','6 Pc Fried Chicken',749,false,'6 pc fried chicken served with spicy dip and garlic dip.'],
  ['Fried Chicken','2 pc Fried Chicken',249,false,'2 crispy fried chicken pieces served with creamy signature garlic dip.'],
  ['Wraps','Classic chicken wrap',169,false,'Classic chicken wrap.'],
  ['Wraps','Tandoori chicken wrap',189,false,'Tandoori chicken wrap.'],
  ['Wraps','Falafel chicken wrap',240,false,'Chicken wrap with falafel-style flavour.'],
  ['Wraps','Falafel wrap',179,true,'Falafel wrap.'],
  ['Wraps','Cheese Chicken Wrap',199,false,'Chicken wrapped loaded with cheese and veggies.'],
  ['Fries','Cheesy fries',220,true,'Golden-brown crispy fries covered with creamy cheese and special seasoning.'],
  ['Fries','Loaded fries [fried chicken]',259,false,'Loaded fries with fried chicken.'],
  ['Fries','French fries',110,true,'Thin crispy salted fries served with tomato ketchup.'],
  ['Fries','Large Fries',159,true,'Crispy golden fries, perfectly salted and served hot.'],
  ['Pop Corn','Chicken Pop Corn',179,false,'Bite-sized crispy chicken popcorn, golden fried and bursting with flavour.'],
  ['Pop Corn','Large Chicken Popcorn',220,false,'Large serving of bite-sized crispy chicken popcorn.'],
  ['Prawns','Fried prawns',399,false,'Fried prawns cooked until golden and crispy.'],
  ['Wings','Fried wings',209,false,'4 crispy fried chicken wings paired with creamy signature garlic dip.'],
  ['Drinks','Cold coffee',199,true,'A soothing cold coffee blended with ice cream.'],
  ['Drinks','Mango shake',220,true,'Rich and creamy mango shake with juicy mango and ice cream.'],
  ['Drinks','Biscoff Shake',249,true,'Creamy shake blended with rich Biscoff cookies.'],
  ['Value Bucket Meals','10 Pc Fried Wings',699,false,'10 crispy chicken wings with fries, soft bun, chilled Coke, coleslaw and 2 garlic mayo.'],
  ['Value Bucket Meals','9 pc strips bucket',699,false,'9 crispy chicken strips with fries, soft bun, chilled Coke, coleslaw and 2 garlic mayo.'],
  ['Value Bucket Meals','Popcorn Bucket',699,false,'2 large popcorn, bun, fries, Coke, coleslaw and 2 garlic dips.'],
  ['Bucket Combos','6 Piece Strips + 2 Crispy Chicken Burger',699,false,'6 piece strips + 2 crispy chicken burgers + 1 garlic dip.'],
  ['Bucket Combos','6 Piece Fried Wings + 6 Piece Strips',666,false,'6 piece fried wings + 6 piece strips + 1 garlic dip + 1 spicy dip.'],
  ['Value Meal','2 Piece Fried Wings + 2 Piece Strips + Mexican Chicken Burger',499,false,'2 piece fried wings + 2 piece strips + Mexican chicken burger + Coke + 1 garlic dip.'],
  ['Value Meal','Crispy Chicken Burger + Cheesy Chicken Wrap + Regular Fries',499,false,'Crispy chicken burger + cheesy chicken wrap + regular fries + Coke.'],
  ['Value Meal','Crispy Chicken Burger + Regular Chicken Popcorn',399,false,'Crispy chicken burger + regular chicken popcorn + Coke + garlic dip.'],
  ['Value Meal','Chick One Burger + Regular Chicken Popcorn',330,false,'Chick one burger + regular chicken popcorn + Coke + 1 garlic dip.'],
  ['Value Meal','6 Piece Fried Prawns + Regular Chicken Popcorn',579,false,'6 piece fried prawns + regular chicken popcorn + Coke + 1 garlic dip.'],
  ['Value Combo','2 Crispy Chicken Burger + Regular Chicken Popcorn',469,false,'2 crispy chicken burgers + regular chicken popcorn + 1 garlic dip.']
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const categoryDocs = {};
  for (let i=0;i<categories.length;i++) {
    const [name,slug,icon] = categories[i];
    categoryDocs[name] = await Category.findOneAndUpdate({slug},{name,slug,icon,sort_order:i},{upsert:true,new:true,setDefaultsOnInsert:true});
  }
  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany(items.map(([category,name,price,isVeg,description],i)=>({
      category_id:categoryDocs[category]._id,name,description,price,image_url:'',is_veg:isVeg,is_bestseller:false,is_available:true,sort_order:i,customizations:[]
    })));
    console.log(`Seeded ${items.length} LSD Okhla menu items`);
  } else {
    console.log(`Menu already contains ${count} items; seed skipped`);
  }
  await mongoose.disconnect();
}

await seed();
// bootstrap.js and server.js share the same Mongoose instance. Remove the seed models
// before server.js registers its own schemas, otherwise Mongoose throws OverwriteModelError.
if (mongoose.models.Category) mongoose.deleteModel('Category');
if (mongoose.models.MenuItem) mongoose.deleteModel('MenuItem');
await import('./server.js');
