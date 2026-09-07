import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  is_admin: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const categorySchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, sort_order: { type: Number, default: 0 }, icon: String }, { timestamps: true });
const menuItemSchema = new mongoose.Schema({ category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, name: String, description: String, price: Number, image_url: String, is_veg: Boolean, is_bestseller: Boolean, is_available: Boolean, sort_order: Number, customizations: Array }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
const settingsSchema = new mongoose.Schema({ _id: { type: Number, default: 1 }, is_open: { type: Boolean, default: true }, delivery_enabled: { type: Boolean, default: true }, pickup_enabled: { type: Boolean, default: true }, delivery_charge: { type: Number, default: 30 }, min_order_amount: { type: Number, default: 99 }, opening_time: { type: String, default: '11:00' }, closing_time: { type: String, default: '23:00' }, phone: { type: String, default: '' }, address: { type: String, default: '' }, name: { type: String, default: 'LSD Burgers' }, tagline: { type: String, default: 'Like Something Dope?' } });
const orderItemSchema = new mongoose.Schema({ menu_item_id: String, name: String, image_url: String, price: Number, quantity: Number, customizations: Array, item_total: Number }, { _id: true });
const orderSchema = new mongoose.Schema({ user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, order_number: { type: String, unique: true }, status: { type: String, default: 'placed' }, subtotal: Number, delivery_charge: Number, discount: Number, total: Number, customer_name: String, customer_phone: String, delivery_type: String, address: String, address_details: String, notes: String, payment_method: String, order_items: [orderItemSchema] }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const RestaurantSettings = mongoose.model('RestaurantSettings', settingsSchema);
const Order = mongoose.model('Order', orderSchema);

const publicUser = (u) => ({ id: u._id.toString(), email: u.email, name: u.name, phone: u.phone, is_admin: u.is_admin, created_at: u.created_at });
const tokenFor = (u) => jwt.sign({ id: u._id.toString() }, JWT_SECRET, { expiresIn: '30d' });

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ success: false, message: 'Invalid or expired token' }); }
}

function adminOnly(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
}

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API is healthy', environment: process.env.NODE_ENV || 'production', timestamp: new Date().toISOString() }));
app.get('/api/health/db', (_req, res) => res.json({ success: true, connected: mongoose.connection.readyState === 1 }));

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name || !phone) return res.status(400).json({ success: false, message: 'Name, phone, email and password are required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const normalized = email.trim().toLowerCase();
    if (await User.exists({ email: normalized })) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    const user = await User.create({ email: normalized, passwordHash: await bcrypt.hash(password, 12), name, phone });
    res.status(201).json({ success: true, token: tokenFor(user), user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Failed to create account' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    res.json({ success: true, token: tokenFor(user), user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Failed to sign in' }); }
});

app.get('/api/auth/me', auth, (req, res) => res.json({ success: true, user: publicUser(req.user) }));
app.put('/api/auth/profile', auth, async (req, res) => {
  const { name, phone } = req.body;
  req.user.name = String(name ?? req.user.name).trim();
  req.user.phone = String(phone ?? req.user.phone).trim();
  await req.user.save();
  res.json({ success: true, user: publicUser(req.user) });
});

app.get('/api/categories', async (_req, res) => res.json({ success: true, data: await Category.find().sort({ sort_order: 1 }) }));
app.get('/api/menu', async (req, res) => {
  const filter = { is_available: true };
  if (req.query.bestseller === 'true') filter.is_bestseller = true;
  if (req.query.category) { const c = await Category.findOne({ slug: req.query.category }); if (c) filter.category_id = c._id; }
  const items = await MenuItem.find(filter).sort({ sort_order: 1 }).populate('category_id');
  res.json({ success: true, data: items.map(i => ({ ...i.toObject(), id: i._id.toString(), category_id: i.category_id?._id?.toString(), category: i.category_id ? { ...i.category_id.toObject(), id: i.category_id._id.toString() } : undefined })) });
});
app.get('/api/settings', async (_req, res) => {
  let settings = await RestaurantSettings.findById(1);
  if (!settings) settings = await RestaurantSettings.create({ _id: 1 });
  res.json({ success: true, data: { ...settings.toObject(), id: 1 } });
});
app.put('/api/settings', auth, adminOnly, async (req, res) => {
  const settings = await RestaurantSettings.findByIdAndUpdate(1, { $set: req.body }, { new: true, upsert: true });
  res.json({ success: true, data: { ...settings.toObject(), id: 1 } });
});

app.post('/api/orders', auth, async (req, res) => {
  try {
    const { items, ...body } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'Order must contain items' });
    const settings = await RestaurantSettings.findById(1);
    if (settings && !settings.is_open) return res.status(400).json({ success: false, message: 'Restaurant is currently closed' });
    const order = await Order.create({ ...body, user_id: req.user._id, order_items: items, order_number: `LSD-${Date.now().toString().slice(-8)}`, status: 'placed' });
    res.status(201).json({ success: true, data: { ...order.toObject(), id: order._id.toString(), order_items: order.order_items.map(x => ({ ...x.toObject(), id: x._id.toString() })) } });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Failed to place order' }); }
});
app.get('/api/orders', auth, async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id }).sort({ created_at: -1 });
  res.json({ success: true, data: orders.map(o => ({ ...o.toObject(), id: o._id.toString(), order_items: o.order_items.map(x => ({ ...x.toObject(), id: x._id.toString() })) })) });
});
app.get('/api/orders/:id', auth, async (req, res) => {
  const filter = req.user.is_admin ? { _id: req.params.id } : { _id: req.params.id, user_id: req.user._id };
  const order = await Order.findOne(filter);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: { ...order.toObject(), id: order._id.toString(), order_items: order.order_items.map(x => ({ ...x.toObject(), id: x._id.toString() })) } });
});
app.get('/api/admin/orders', auth, adminOnly, async (_req, res) => {
  const orders = await Order.find().sort({ created_at: -1 }).limit(100);
  res.json({ success: true, data: orders });
});
app.patch('/api/admin/orders/:id/status', auth, adminOnly, async (req, res) => {
  const allowed = ['placed','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});
app.get('/api/admin/stats', auth, adminOnly, async (_req, res) => {
  const start = new Date(); start.setHours(0,0,0,0);
  const today = await Order.find({ created_at: { $gte: start } });
  const all = await Order.find({}, 'status total order_items');
  const completed = today.filter(o => o.status === 'delivered');
  const itemMap = new Map();
  all.forEach(o => o.order_items.forEach(i => itemMap.set(i.name, (itemMap.get(i.name) || 0) + Number(i.quantity || 0))));
  res.json({ success: true, data: { todayOrders: today.length, todayRevenue: completed.reduce((s,o)=>s+Number(o.total||0),0), pending: today.filter(o=>!['delivered','cancelled'].includes(o.status)).length, completed: completed.length, cancelled: today.filter(o=>o.status==='cancelled').length, popularItems: [...itemMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>({name,count})), recentOrders: (await Order.find().sort({created_at:-1}).limit(5)) } });
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  if (!JWT_SECRET) throw new Error('JWT_SECRET is required');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  await RestaurantSettings.updateOne({ _id: 1 }, { $setOnInsert: { _id: 1 } }, { upsert: true });
  app.listen(PORT, '0.0.0.0', () => console.log(`LSD Burgers API listening on port ${PORT}`));
}
start().catch((err) => { console.error('Failed to start server:', err); process.exit(1); });
