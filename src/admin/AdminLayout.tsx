import { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, UtensilsCrossed, Settings, LogOut, Menu as MenuIcon, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const { settings } = useRestaurant();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-lsd-gray-50">
        <p className="text-lsd-gray-500">You don't have admin access.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders', icon: Package },
    { to: '/admin/menu', label: 'Menu Items', icon: UtensilsCrossed },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-lsd-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-lsd-gray-900 border-r border-lsd-gray-800 z-50 flex flex-col transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b border-lsd-gray-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-lsd-blue flex items-center justify-center font-display text-white text-xl shadow-blue">
              LSD
            </div>
            <div>
              <p className="font-display text-lg tracking-tight text-white">Admin Panel</p>
              <p className="text-[9px] uppercase tracking-widest text-lsd-blue-light font-semibold">Like Something Dope</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                onClick={() => handleNav(item.to)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.to)
                    ? 'bg-lsd-blue text-white shadow-blue'
                    : 'text-lsd-gray-400 hover:bg-lsd-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-lsd-gray-800 space-y-1">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-lsd-gray-400 hover:bg-lsd-gray-800 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
            Back to Site
          </button>
          <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-lsd-error hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-lsd-gray-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-lsd-gray-200 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg bg-lsd-gray-100 border border-lsd-gray-200">
            {sidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
          <span className="font-display text-lg tracking-tight text-lsd-gray-900">LSD Admin</span>
          <div className={`w-2 h-2 rounded-full ${settings?.is_open ? 'bg-lsd-success' : 'bg-lsd-error'}`} />
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
