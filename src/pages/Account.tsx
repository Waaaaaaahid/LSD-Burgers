import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Phone, Mail, LogOut, Package, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

export function Account() {
  const { session, profile, signOut, refreshProfile } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 px-4">
        <UserIcon className="w-16 h-16 text-lsd-gray-300" />
        <p className="text-lsd-gray-500">Please sign in to view your account.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary">Sign In</button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name, phone })
      .eq('id', session.user.id);
    if (error) {
      show('Failed to update profile', 'error');
    } else {
      await refreshProfile();
      show('Profile updated', 'success');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <h1 className="font-display text-4xl tracking-tight text-lsd-gray-900 mb-6">My Account</h1>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-lsd-blue-lightest border border-lsd-blue-lighter flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-lsd-blue" />
          </div>
          <div>
            <p className="font-bold text-lsd-gray-900">{profile?.name || 'LSD User'}</p>
            <p className="text-sm text-lsd-gray-500">{session.user.email}</p>
            {profile?.is_admin && (
              <span className="inline-flex items-center gap-1 mt-1 badge bg-lsd-blue text-white">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-lsd-gray-500 mb-2">
          <Mail className="w-4 h-4 text-lsd-gray-400" />
          <span>{session.user.email}</span>
        </div>
        {profile?.phone && (
          <div className="flex items-center gap-2 text-sm text-lsd-gray-500">
            <Phone className="w-4 h-4 text-lsd-gray-400" />
            <span>{profile.phone}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="card p-5 mb-4 space-y-4">
        <h2 className="font-bold text-sm uppercase tracking-wide text-lsd-blue">Edit Profile</h2>
        <div>
          <label className="text-xs text-lsd-gray-500 mb-1.5 block">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-xs text-lsd-gray-500 mb-1.5 block">Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="card p-2">
        <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-lsd-gray-50 transition-colors">
          <Package className="w-5 h-5 text-lsd-blue" />
          <span className="text-sm font-semibold text-lsd-gray-900 flex-1 text-left">My Orders</span>
          <ChevronRight className="w-4 h-4 text-lsd-gray-400" />
        </button>
        {profile?.is_admin && (
          <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-lsd-gray-50 transition-colors">
            <Shield className="w-5 h-5 text-lsd-blue" />
            <span className="text-sm font-semibold text-lsd-gray-900 flex-1 text-left">Admin Panel</span>
            <ChevronRight className="w-4 h-4 text-lsd-gray-400" />
          </button>
        )}
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-lsd-error">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold flex-1 text-left">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
