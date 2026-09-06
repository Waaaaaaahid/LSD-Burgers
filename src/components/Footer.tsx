import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';

export function Footer() {
  const { settings } = useRestaurant();

  return (
    <footer className="bg-lsd-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-lsd-blue flex items-center justify-center font-display text-white text-xl shadow-blue">
                LSD
              </div>
              <div>
                <p className="font-display text-lg tracking-tight">LSD</p>
                <p className="text-[9px] uppercase tracking-widest text-lsd-blue-light font-semibold">Like Something Dope</p>
              </div>
            </div>
            <p className="text-sm text-lsd-gray-400 leading-relaxed">
              Burgers. Crispy Chicken. Big Flavours. The doppest fast food in Okhla, Jamia Nagar.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm text-lsd-gray-400 hover:text-lsd-blue-light transition-colors">Home</Link></li>
              <li><Link to="/menu" className="text-sm text-lsd-gray-400 hover:text-lsd-blue-light transition-colors">Menu</Link></li>
              <li><Link to="/orders" className="text-sm text-lsd-gray-400 hover:text-lsd-blue-light transition-colors">My Orders</Link></li>
              <li><Link to="/account" className="text-sm text-lsd-gray-400 hover:text-lsd-blue-light transition-colors">Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Visit Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-lsd-gray-400">
                <MapPin className="w-4 h-4 text-lsd-blue-light flex-shrink-0 mt-0.5" />
                <span>{settings?.address || 'Okhla, Jamia Nagar, New Delhi - 110025'}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-lsd-gray-400">
                <Phone className="w-4 h-4 text-lsd-blue-light flex-shrink-0" />
                <span>{settings?.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-lsd-gray-400">
                <Clock className="w-4 h-4 text-lsd-blue-light flex-shrink-0 mt-0.5" />
                <span>{settings?.opening_time || '11:00'} – {settings?.closing_time || '23:59'} Daily</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-lsd-gray-800 flex items-center justify-center hover:bg-lsd-blue transition-colors text-lsd-gray-400 hover:text-white" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-lsd-gray-800 flex items-center justify-center hover:bg-lsd-blue transition-colors text-lsd-gray-400 hover:text-white" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-lsd-gray-800 flex items-center justify-center hover:bg-lsd-blue transition-colors text-lsd-gray-400 hover:text-white" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-6 space-y-2">
              <Link to="/privacy" className="block text-sm text-lsd-gray-400 hover:text-lsd-blue-light transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block text-sm text-lsd-gray-400 hover:text-lsd-blue-light transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-lsd-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-lsd-gray-500">© {new Date().getFullYear()} LSD — Like Something Dope. All rights reserved.</p>
          <p className="text-xs text-lsd-gray-500">Made with big flavours in New Delhi.</p>
        </div>
      </div>
    </footer>
  );
}
