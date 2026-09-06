import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { RestaurantProvider } from '@/context/RestaurantContext';
import { ToastProvider } from '@/context/ToastContext';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { Menu } from '@/pages/Menu';
import { Auth } from '@/pages/Auth';
import { Checkout } from '@/pages/Checkout';
import { Orders } from '@/pages/Orders';
import { Account } from '@/pages/Account';
import { Privacy, Terms } from '@/pages/Static';
import { AdminLayout } from '@/admin/AdminLayout';
import { AdminDashboard } from '@/admin/AdminDashboard';
import { AdminOrders } from '@/admin/AdminOrders';
import { AdminMenu } from '@/admin/AdminMenu';
import { AdminSettings } from '@/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RestaurantProvider>
          <ToastProvider>
            <CartProvider>
              <Routes>
                {/* Customer routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="menu" element={<AdminMenu />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Routes>
            </CartProvider>
          </ToastProvider>
        </RestaurantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
