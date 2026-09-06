import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, X, User, Home, UtensilsCrossed, Package, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';

export function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const { totalItems } = useCart();
  const { profile, signOut } = useAuth();
  const { settings } = useRestaurant();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/orders', label: 'Orders', icon: Package },
    { to: '/account', label: 'Account', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-lsd-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo onClick={() => setMobileOpen(false)} />

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => handleNav(link.to)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-lsd-blue bg-lsd-blue-lightest'
                    : 'text-lsd-gray-600 hover:text-lsd-blue hover:bg-lsd-gray-100'
                }`}
              >
                {link.label}
              </button>
            ))}
            {profile?.is_admin && (
              <button
                onClick={() => handleNav('/admin')}
                className="px-4 py-2 rounded-xl font-semibold text-sm text-white bg-lsd-blue hover:bg-lsd-blue-dark transition-all"
              >
                Admin
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCartOpen}
              className="relative p-2.5 rounded-xl bg-lsd-blue-lightest border border-lsd-blue-lighter hover:bg-lsd-blue-lightest/70 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5 text-lsd-blue" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-lsd-accent text-white text-xs font-bold flex items-center justify-center animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl bg-lsd-gray-100 border border-lsd-gray-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {settings && (
          <div className={`h-1 ${settings.is_open ? 'bg-lsd-success' : 'bg-lsd-error'}`} />
        )}
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-lsd-gray-900/40 backdrop-blur-sm animate-fade-in" />
          <div
            className="absolute top-16 left-0 right-0 bg-white border-b border-lsd-gray-200 shadow-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.to}
                    onClick={() => handleNav(link.to)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all ${
                      isActive(link.to)
                        ? 'text-lsd-blue bg-lsd-blue-lightest'
                        : 'text-lsd-gray-600 hover:bg-lsd-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </button>
                );
              })}
              {profile?.is_admin && (
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-white bg-lsd-blue"
                >
                  <UtensilsCrossed className="w-5 h-5" />
                  Admin Panel
                </button>
              )}
              {profile && (
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-lsd-error hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
