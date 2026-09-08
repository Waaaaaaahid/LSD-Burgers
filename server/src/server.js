import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET;
const clientOrigins = (process.env.CLIENT_URL || 'https://lsdburgers.vercel.app').split(',').map(x => x.trim().replace(/\/$/, '')).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: (origin, cb) => !origin || clientOrigins.includes(origin?.replace(/\/$/, '')) ? cb(null, true) : cb(null, false), credentials: false }));
app.use(express.json({ limit: '2mb' }));

const userSchema = new mongoose.Schema({ email:{type:String,required:true,unique:true,lowercase:true,trim:true}, passwordHash:{type:String,required:true}, name:{type:String,required:true,trim:true}, phone:{type:String,default:''}, is_admin:{type:Boolean,default:false} }, {timestamps:{createdAt:'created_at',updatedAt:'updated_at'}});
const categorySchema = new mongoose.Schema({ name:{type:String,required:true}, slug:{type:String,required:true,unique:true}, sort_order:{type:Number,default:0}, icon:{type:String,default:''} }, {timestamps:true});
const menuSchema = new mongoose.Schema({ category_id:{type:mongoose.Schema.Types.ObjectId,ref:'Category',required:true}, name:{type:String,required:true}, description:{type:String,default:''}, price:{type:Number,required:true}, image_url:{type:String,default:''}, is_veg:{type:Boolean,default:false}, is_bestseller:{type:Boolean,default:false}, is_available:{type:Boolean,default:true}, sort_order:{type:Number,default:0}, customizations:{type:Array,default:[]} }, {timestamps:{createdAt:'created_at',updatedAt:'updated_at'}});
const settingsSchema = new mongoose.Schema({ _id:{type:Number,default:1}, is_open:{type:Boolean,default:true}, delivery_enabled:{type:Boolean,default:true}, pickup_enabled:{type:Boolean,default:true}, delivery_charge:{type:Number,default:30}, min_order_amount:{type:Number,default:99}, opening_time:{type:String,default:'11:00'}, closing_time:{type:String,default:'23:00'}, phone:{type:String,default:''}, address:{type:String,default:''}, name:{type:String,default:'LSD Burgers'}, tagline:{type:String,default:'Like Something Dope?'} });
const orderItemSchema = new mongoose.Schema({ menu_item_id:String, name:String, image_url:String, price:Number, quantity:Number, customizations:Array, item_total:Number });
const orderSchema = new mongoose.Schema({ user_id:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, order_number:{type:String,unique:true}, status:{type:String,default:'placed'}, subtotal:{type:Number,default:0}, delivery_charge:{type:Number,default:0}, discount:{type:Number,default:0}, total:{type:Number,default:0}, customer_name:String, customer_phone:String, delivery_type:String, address:String, address_details:String, notes:String, payment_method:String, order_items:[orderItemSchema] }, {timestamps:{createdAt:'created_at',updatedAt:'updated_at'}});
const User=mongoose.models.User||mongoose.model('User',userSchema);
const Category=mongoose.models.Category||mongoose.model('Category',categorySchema);
const MenuItem=mongoose.models.MenuItem||mongoose.model('MenuItem',menuSchema);
const RestaurantSettings=mongoose.models.RestaurantSettings||mongoose.model('RestaurantSettings',settingsSchema);
const Order=mongoose.models.Order||mongoose.model('Order',orderSchema);

const userOut=u=>({id:u._id.toString(),email:u.email,name:u.name,phone:u.phone,is_admin:u.is_admin,created_at:u.created_at});
const tokenFor=u=>jwt.sign({id:u._id.toString()},JWT_SECRET,{expiresIn:'30d'});
const categoryOut=c=>({id:c._id.toString(),name:c.name,slug:c.slug,sort_order:c.sort_order,icon:c.icon});
const menuOut=i=>{const x=i.toObject();const c=x.category_id&&typeof x.category_id==='object'&&!x.category_id._bsontype?x.category_id:null;return {...x,id:i._id.toString(),category_id:c?c._id.toString():String(x.category_id),category:c?categoryOut(c):undefined};};
const orderOut=o=>({...o.toObject(),id:o._id.toString(),order_items:(o.order_items||[]).map(x=>({...x.toObject(),id:x._id.toString()}))});

async function auth(req,res,next){try{const h=req.headers.authorization||'';if(!h.startsWith('Bearer '))return res.status(401).json({success:false,message:'Authentication required'});const p=jwt.verify(h.slice(7),JWT_SECRET);const u=await User.findById(p.id);if(!u)return res.status(401).json({success:false,message:'User not found'});req.user=u;next();}catch{return res.status(401).json({success:false,message:'Invalid or expired token'});}}
const adminOnly=(req,res,next)=>req.user?.is_admin?next():res.status(403).json({success:false,message:'Admin access required'});

app.get('/api/health',(_,res)=>res.json({success:true,message:'API is healthy',timestamp:new Date().toISOString()}));
app.get('/api/health/db',(_,res)=>res.json({success:true,connected:mongoose.connection.readyState===1}));

app.post('/api/auth/signup',async(req,res)=>{try{const email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||''),name=String(req.body.name||'').trim(),phone=String(req.body.phone||'').trim();if(!email||!password||!name||!phone)return res.status(400).json({success:false,message:'Name, phone, email and password are required'});if(password.length<6)return res.status(400).json({success:false,message:'Password must be at least 6 characters'});if(await User.exists({email}))return res.status(409).json({success:false,message:'An account with this email already exists'});const u=await User.create({email,passwordHash:await bcrypt.hash(password,12),name,phone});res.status(201).json({success:true,token:tokenFor(u),user:userOut(u)});}catch(e){console.error(e);res.status(500).json({success:false,message:'Failed to create account'});}});
app.post('/api/auth/login',async(req,res)=>{try{const u=await User.findOne({email:String(req.body.email||'').trim().toLowerCase()});if(!u||!(await bcrypt.compare(String(req.body.password||''),u.passwordHash)))return res.status(401).json({success:false,message:'Invalid email or password'});res.json({success:true,token:tokenFor(u),user:userOut(u)});}catch(e){console.error(e);res.status(500).json({success:false,message:'Failed to sign in'});}});
app.get('/api/auth/me',auth,(req,res)=>res.json({success:true,user:userOut(req.user)}));
app.put('/api/auth/profile',auth,async(req,res)=>{try{req.user.name=String(req.body.name??req.user.name).trim();req.user.phone=String(req.body.phone??req.user.phone).trim();await req.user.save();res.json({success:true,user:userOut(req.user)});}catch{res.status(500).json({success:false,message:'Failed to update profile'});}});

app.get('/api/categories',async(_,res)=>{try{const rows=await Category.find().sort({sort_order:1});res.json({success:true,data:rows.map(categoryOut)});}catch(e){console.error(e);res.status(500).json({success:false,message:'Failed to load categories'});}});
app.post('/api/admin/categories',auth,adminOnly,async(req,res)=>{try{const name=String(req.body.name||'').trim();const slug=String(req.body.slug||name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(!name||!slug)return res.status(400).json({success:false,message:'Category name is required'});const c=await Category.create({name,slug,sort_order:Number(req.body.sort_order)||0,icon:String(req.body.icon||'')});res.status(201).json({success:true,data:categoryOut(c)});}catch{res.status(400).json({success:false,message:'Failed to create category'});}});

app.get('/api/menu',async(req,res)=>{try{const filter={is_available:true};if(req.query.bestseller==='true')filter.is_bestseller=true;if(req.query.category){const c=await Category.findOne({slug:String(req.query.category)});if(!c)return res.json({success:true,data:[]});filter.category_id=c._id;}const rows=await MenuItem.find(filter).sort({sort_order:1}).populate('category_id');res.json({success:true,data:rows.map(menuOut)});}catch(e){console.error('MENU_ERROR',e);res.status(500).json({success:false,message:'Failed to load menu'});}});
app.get('/api/admin/menu',auth,adminOnly,async(_,res)=>{try{const rows=await MenuItem.find().sort({sort_order:1}).populate('category_id');res.json({success:true,data:rows.map(menuOut)});}catch{res.status(500).json({success:false,message:'Failed to load menu'});}});
async function saveMenu(req,res){try{const body={...req.body};if(body.category_id)body.category_id=new mongoose.Types.ObjectId(body.category_id);body.price=Number(body.price)||0;body.sort_order=Number(body.sort_order)||0;const m=req.params.id?await MenuItem.findByIdAndUpdate(req.params.id,body,{new:true,runValidators:true}):await MenuItem.create(body);if(!m)return res.status(404).json({success:false,message:'Menu item not found'});res.status(req.params.id?200:201).json({success:true,data:menuOut(await m.populate('category_id'))});}catch(e){console.error(e);res.status(400).json({success:false,message:'Failed to save menu item'});}}
app.post('/api/admin/menu',auth,adminOnly,saveMenu);
app.put('/api/admin/menu/:id',auth,adminOnly,saveMenu);
app.patch('/api/admin/menu/:id',auth,adminOnly,saveMenu);
app.delete('/api/admin/menu/:id',auth,adminOnly,async(req,res)=>{try{const m=await MenuItem.findByIdAndDelete(req.params.id);if(!m)return res.status(404).json({success:false,message:'Menu item not found'});res.json({success:true});}catch{res.status(400).json({success:false,message:'Failed to delete menu item'});}});

app.get('/api/settings',async(_,res)=>{try{const s=await RestaurantSettings.findById(1);res.json({success:true,data:s});}catch{res.status(500).json({success:false,message:'Failed to load settings'});}});
app.put('/api/admin/settings',auth,adminOnly,async(req,res)=>{try{const s=await RestaurantSettings.findByIdAndUpdate(1,req.body,{new:true,upsert:true,setDefaultsOnInsert:true});res.json({success:true,data:s});}catch{res.status(400).json({success:false,message:'Failed to update settings'});}});
app.patch('/api/admin/settings',auth,adminOnly,async(req,res)=>{try{const s=await RestaurantSettings.findByIdAndUpdate(1,req.body,{new:true,upsert:true,setDefaultsOnInsert:true});res.json({success:true,data:s});}catch{res.status(400).json({success:false,message:'Failed to update settings'});}});

app.get('/api/orders',auth,async(req,res)=>{try{const rows=await Order.find({user_id:req.user._id}).sort({created_at:-1});res.json({success:true,data:rows.map(orderOut)});}catch{res.status(500).json({success:false,message:'Failed to load orders'});}});
app.post('/api/orders',auth,async(req,res)=>{try{const d=req.body||{};const o=await Order.create({...d,user_id:req.user._id,order_number:d.order_number||`LSD-${Date.now()}`});res.status(201).json({success:true,data:orderOut(o)});}catch(e){console.error(e);res.status(400).json({success:false,message:'Failed to place order'});}});
app.get('/api/admin/orders',auth,adminOnly,async(_,res)=>{try{const rows=await Order.find().sort({created_at:-1});res.json({success:true,data:rows.map(orderOut)});}catch{res.status(500).json({success:false,message:'Failed to load orders'});}});
app.put('/api/admin/orders/:id',auth,adminOnly,async(req,res)=>{try{const o=await Order.findByIdAndUpdate(req.params.id,req.body,{new:true});if(!o)return res.status(404).json({success:false,message:'Order not found'});res.json({success:true,data:orderOut(o)});}catch{res.status(400).json({success:false,message:'Failed to update order'});}});
app.patch('/api/admin/orders/:id',auth,adminOnly,async(req,res)=>{try{const o=await Order.findByIdAndUpdate(req.params.id,req.body,{new:true});if(!o)return res.status(404).json({success:false,message:'Order not found'});res.json({success:true,data:orderOut(o)});}catch{res.status(400).json({success:false,message:'Failed to update order'});}});
app.get('/api/orders/stats/overview',auth,adminOnly,async(_,res)=>{const total=await Order.countDocuments();const revenue=(await Order.aggregate([{$group:{_id:null,total:{$sum:'$total'}}}]))[0]?.total||0;res.json({success:true,data:{totalOrders:total,totalRevenue:revenue}});});
app.get('/api/orders/stats/sales',auth,adminOnly,async(_,res)=>{const rows=await Order.aggregate([{$group:{_id:{$dateToString:{format:'%Y-%m-%d',date:'$created_at'}},sales:{$sum:'$total'},orders:{$sum:1}}},{$sort:{_id:1}}]);res.json({success:true,data:rows});});

app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({success:false,message:'Server error'});});
app.use((_,res)=>res.status(404).json({success:false,message:'Route not found'}));

const categories=[['Burgers','burgers','🍔'],['Fried Chicken','fried-chicken','🍗'],['Wraps','wraps','🌯'],['Fries','fries','🍟'],['Pop Corn','pop-corn','🍿'],['Prawns','prawns','🍤'],['Wings','wings','🍗'],['Drinks','drinks','🥤'],['Value Bucket Meals','value-bucket-meals','🪣'],['Bucket Combos','bucket-combos','🍗'],['Value Meal','value-meal','🍱'],['Value Combo','value-combo','🍔']];
const menu=[['Burgers','Veg One Burger',79,true],['Burgers','Chicken patty burger',89,false],['Burgers','Blaze Chick One Burger',109,false],['Burgers','Crispy chicken burger',169,false],['Burgers','Chicken tandoori cheese burger',199,false],['Burgers','Mexican cheese burger',199,false],['Burgers','All Cheese Chicken Burger',220,false],['Burgers','Blaze Veg One Burger',99,true],['Burgers','Chick One Burger',89,false],['Fried Chicken','Chicken strip',178,false],['Fried Chicken','4 Pc Fried Chicken',499,false],['Fried Chicken','6 Pc Fried Chicken',749,false],['Fried Chicken','2 pc Fried Chicken',249,false],['Wraps','Classic chicken wrap',169,false],['Wraps','Tandoori chicken wrap',189,false],['Wraps','Falafel chicken wrap',240,false],['Wraps','Falafel wrap',179,true],['Wraps','Cheese Chicken Wrap',199,false],['Fries','Cheesy fries',220,true],['Fries','Loaded fries [fried chicken]',259,false],['Fries','French fries',110,true],['Fries','Large Fries',159,true],['Pop Corn','Chicken Pop Corn',179,false],['Pop Corn','Large Chicken Popcorn',220,false],['Prawns','Fried prawns',399,false],['Wings','Fried wings',209,false],['Drinks','Cold coffee',199,true],['Drinks','Mango shake',220,true],['Drinks','Biscoff Shake',249,true],['Value Bucket Meals','10 Pc Fried Wings',699,false],['Value Bucket Meals','9 pc strips bucket',699,false],['Value Bucket Meals','Popcorn Bucket',699,false],['Bucket Combos','6 Piece Strips + 2 Crispy Chicken Burger',699,false],['Bucket Combos','6 Piece Fried Wings + 6 Piece Strips',666,false],['Value Meal','2 Piece Fried Wings + 2 Piece Strips + Mexican Chicken Burger',499,false],['Value Meal','Crispy Chicken Burger + Cheesy Chicken Wrap + Regular Fries',499,false],['Value Meal','Crispy Chicken Burger + Regular Chicken Popcorn',399,false],['Value Meal','Chick One Burger + Regular Chicken Popcorn',330,false],['Value Meal','6 Piece Fried Prawns + Regular Chicken Popcorn',579,false],['Value Combo','2 Crispy Chicken Burger + Regular Chicken Popcorn',469,false]];

async function seed(){for(let i=0;i<categories.length;i++){const [name,slug,icon]=categories[i];await Category.findOneAndUpdate({slug},{name,slug,icon,sort_order:i},{upsert:true,new:true,setDefaultsOnInsert:true});}const count=await MenuItem.countDocuments();if(count===0){const map=Object.fromEntries((await Category.find()).map(c=>[c.name,c]));await MenuItem.insertMany(menu.map(([category,name,price,is_veg],i)=>({category_id:map[category]._id,name,price,is_veg,is_available:true,is_bestseller:i<3,sort_order:i,image_url:'',description:'Freshly made at LSD Burgers.',customizations:[]})));console.log('Seeded LSD menu');}await RestaurantSettings.updateOne({_id:1},{$setOnInsert:{_id:1}},{upsert:true});}

async function seedAdmin(){
  const email=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
  const password=String(process.env.ADMIN_PASSWORD||'');
  if(!email && !password)return;
  if(!email || password.length<12){
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) are required together');
  }
  const name=String(process.env.ADMIN_NAME||'LSD Burgers Admin').trim();
  const phone=String(process.env.ADMIN_PHONE||'').trim();
  let admin=await User.findOne({email});
  if(!admin){
    admin=await User.create({email,passwordHash:await bcrypt.hash(password,12),name,phone,is_admin:true});
    console.log(`Admin account created for ${email}`);
    return;
  }
  if(!admin.is_admin){
    admin.is_admin=true;
    await admin.save();
    console.log(`Existing account promoted to admin: ${email}`);
  }
}

async function start(){if(!JWT_SECRET)throw new Error('JWT_SECRET is required');if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required');await mongoose.connect(process.env.MONGODB_URI);console.log('MongoDB connected');await seed();await seedAdmin();app.listen(PORT,'0.0.0.0',()=>console.log(`LSD Burgers API listening on ${PORT}`));}
start().catch(e=>{console.error('STARTUP_ERROR',e);process.exit(1);});
