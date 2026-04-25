import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BetSlipProvider } from './context/BetSlipContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import BetSlip from './components/BetSlip';
import Footer from './components/Footer';
import Home from './pages/Home';
import Sports from './pages/Sports';
import LiveBetting from './pages/LiveBetting';
import MyBets from './pages/MyBets';
import Auth from './pages/Auth';
import Transactions from './pages/Transactions';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ResponsibleGambling from './pages/ResponsibleGambling';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBets from './pages/admin/AdminBets';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminEvents from './pages/admin/AdminEvents';
import SplashScreen from './components/SplashScreen';
import './App.css';

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onFinished={hideSplash} />}
    <Router>
      <AuthProvider>
        <BetSlipProvider>
          <ToastProvider>
            <Routes>
              {/* Admin routes — separate layout, no BetSlip/Footer */}
              <Route
                path="/admin/*"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="bets" element={<AdminBets />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="events" element={<AdminEvents />} />
              </Route>

              {/* Public routes — normal layout */}
              <Route
                path="*"
                element={
                  <div className="app-layout">
                    <Navbar />
                    <div className="main-content">
                      <div className="page-content">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/sports" element={<Sports />} />
                          <Route path="/sports/:sportKey" element={<Sports />} />
                          <Route path="/live" element={<LiveBetting />} />
                          <Route path="/my-bets" element={<MyBets />} />
                          <Route path="/transactions" element={<Transactions />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/responsible-gambling" element={<ResponsibleGambling />} />
                        </Routes>
                      </div>
                      <BetSlip />
                    </div>
                    <Footer />
                  </div>
                }
              />
            </Routes>
          </ToastProvider>
        </BetSlipProvider>
      </AuthProvider>
    </Router>
    </>
  );
}

export default App;
