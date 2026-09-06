import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, Star, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { MenuItem, Category } from '@/types';
import { formatPrice } from '@/lib/format';

interface EditItem {
  id?: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  is_veg: boolean;
  is_bestseller: boolean;
  is_available: boolean;
  sort_order: string;
}

const EMPTY_ITEM: EditItem = {
  name: '', description: '', price: '', image_url: '', category_id: '',
  is_veg: false, is_bestseller: false, is_available: true, sort_order: '0',
};

export function AdminMenu() {
  const { show } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [editing, setEditing] = useState<EditItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    const [itemRes, catRes] = await Promise.all([
      supabase.from('menu_items').select('*, category:categories(*)').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    if (itemRes.data) setItems(itemRes.data as MenuItem[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);

    const payload = {
      name: editing.name,
      description: editing.description,
      price: parseFloat(editing.price) || 0,
      image_url: editing.image_url,
      category_id: editing.category_id,
      is_veg: editing.is_veg,
      is_bestseller: editing.is_bestseller,
      is_available: editing.is_available,
      sort_order: parseInt(editing.sort_order) || 0,
    };

    if (editing.id) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editing.id);
      if (error) show('Failed to update item', 'error');
      else show('Item updated', 'success');
    } else {
      const { error } = await supabase.from('menu_items').insert(payload);
      if (error) show('Failed to create item', 'error');
      else show('Item created', 'success');
    }

    setSaving(false);
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item? This cannot be undone.')) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) show('Failed to delete item', 'error');
    else show('Item deleted', 'success');
    fetchItems();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id);
    fetchItems();
  };

  const toggleBestseller = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ is_bestseller: !item.is_bestseller }).eq('id', item.id);
    fetchItems();
  };

  const filteredItems = items.filter((item) => {
    if (filterCat !== 'all' && item.category?.slug !== filterCat) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-lsd-gray-900">Menu Management</h1>
          <p className="text-sm text-lsd-gray-500">Add, edit, and manage menu items</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_ITEM, category_id: categories[0]?.id || '' })}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lsd-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="card p-3 flex items-center gap-3">
              <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`veg-dot ${item.is_veg ? 'veg-dot-veg' : 'veg-dot-nonveg'}`} />
                  <p className="font-semibold text-sm text-lsd-gray-900 truncate">{item.name}</p>
                  {item.is_bestseller && <Star className="w-3.5 h-3.5 text-lsd-blue fill-current" />}
                </div>
                <p className="text-xs text-lsd-gray-400">{item.category?.name} \u00B7 {formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleAvailable(item)}
                  className={`p-2 rounded-lg transition-colors ${item.is_available ? 'text-lsd-success hover:bg-green-50' : 'text-lsd-gray-300 hover:bg-lsd-gray-100'}`}
                  title={item.is_available ? 'Available' : 'Unavailable'}
                >
                  {item.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => toggleBestseller(item)}
                  className={`p-2 rounded-lg transition-colors ${item.is_bestseller ? 'text-lsd-blue hover:bg-lsd-blue-lightest' : 'text-lsd-gray-300 hover:bg-lsd-gray-100'}`}
                  title="Toggle bestseller"
                >
                  <Star className={`w-4 h-4 ${item.is_bestseller ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => setEditing({
                    id: item.id, name: item.name, description: item.description,
                    price: String(item.price), image_url: item.image_url,
                    category_id: item.category_id, is_veg: item.is_veg,
                    is_bestseller: item.is_bestseller, is_available: item.is_available,
                    sort_order: String(item.sort_order),
                  })}
                  className="p-2 rounded-lg text-lsd-blue hover:bg-lsd-blue-lightest transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-lsd-error hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setEditing(null)}>
          <div className="absolute inset-0 bg-lsd-gray-900/50 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-lsd-gray-200 max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-lsd-gray-200 p-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-lsd-gray-900">{editing.id ? 'Edit Item' : 'New Item'}</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-lsd-gray-100">
                <X className="w-5 h-5 text-lsd-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-lsd-gray-500 mb-1.5 block">Name</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="text-xs text-lsd-gray-500 mb-1.5 block">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-lsd-gray-500 mb-1.5 block">Price (\u20B9)</label>
                  <input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} required className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-lsd-gray-500 mb-1.5 block">Sort Order</label>
                  <input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-xs text-lsd-gray-500 mb-1.5 block">Image URL</label>
                <input type="url" value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." className="input-field" />
                {editing.image_url && (
                  <img src={editing.image_url} alt="Preview" className="mt-2 w-20 h-20 rounded-xl object-cover" />
                )}
              </div>
              <div>
                <label className="text-xs text-lsd-gray-500 mb-1.5 block">Category</label>
                <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} required className="input-field">
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.is_veg} onChange={(e) => setEditing({ ...editing, is_veg: e.target.checked })} className="w-4 h-4 accent-lsd-success" />
                  <span className="text-sm text-lsd-gray-900 font-medium">Veg</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.is_bestseller} onChange={(e) => setEditing({ ...editing, is_bestseller: e.target.checked })} className="w-4 h-4 accent-lsd-blue" />
                  <span className="text-sm text-lsd-gray-900 font-medium">Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.is_available} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} className="w-4 h-4 accent-lsd-blue" />
                  <span className="text-sm text-lsd-gray-900 font-medium">Available</span>
                </label>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving...' : editing.id ? 'Update Item' : 'Create Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
