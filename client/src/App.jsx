import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollArrows from './components/ScrollArrows';
import WelcomeMessage from './components/WelcomeMessage';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import OtpVerify from './pages/OtpVerify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BecomeProvider from './pages/BecomeProvider';
import HowItWorks from './pages/HowItWorks';
import WhyUs from './pages/WhyUs';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CustomerDashboard from './pages/customer/Dashboard';
import MyBookings from './pages/customer/MyBookings';
import CustomerProfile from './pages/customer/CustomerProfile';
import NearMe from './pages/customer/NearMe';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import ProviderDashboard from './pages/provider/Dashboard';
import AddService from './pages/provider/AddService';
import EditService from './pages/provider/EditService';
import MyServices from './pages/provider/MyServices';
import ProviderBookings from './pages/provider/ProviderBookings';
import CompletedJobs from './pages/provider/CompletedJobs';
import ProviderProfile from './pages/provider/ProviderProfile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="App min-h-screen bg-white dark:bg-neutral-950 flex flex-col transition-colors duration-300">
            <Navbar />
            <WelcomeMessage />
            <main className="pt-28 md:pt-32 flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OtpVerify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/become-provider" element={<BecomeProvider />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/why-us" element={<WhyUs />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Admin Login (Public but restricted) */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Customer Routes (Protected) */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/bookings"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/near-me"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <NearMe />
                  </ProtectedRoute>
                }
              />

              {/* Provider Routes (Protected) */}
              <Route
                path="/provider/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <MyServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services/add"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <AddService />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <EditService />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/bookings"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/completed"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <CompletedJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/profile"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/setup"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes (Protected) */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Booking Route (Protected) */}
              <Route
                path="/book/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Booking />
                  </ProtectedRoute>
                }
              />

              {/* Payment Route (Protected) */}
              <Route
                path="/payment/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Payment />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <ScrollArrows />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
