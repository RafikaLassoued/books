import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Store Pages
import StorePage from './pages/store/StorePage'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminBooks from './pages/admin/AdminBooks'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'
import AdminReviews from './pages/admin/AdminReviews'
import AdminLogin from './pages/admin/AdminLogin'

// Diagnostics
import DiagnosticsPage from './pages/DiagnosticsPage'

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="bottom-center" toastOptions={{
              style: { fontFamily: 'Cairo, sans-serif', direction: 'rtl' },
              duration: 3000,
            }} />
            <Routes>
              {/* المتجر */}
              <Route path="/" element={<StorePage />} />

              {/* التشخيص */}
              <Route path="/diagnostics" element={<DiagnosticsPage />} />

              {/* الأدمن */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}

export default App
