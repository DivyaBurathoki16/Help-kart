import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollArrows from './components/ScrollArrows';
import WelcomeMessage from './components/WelcomeMessage';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
  </div>
);

// Pages - Lazy loaded for better performance
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OtpVerify = lazy(() => import('./pages/OtpVerify'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const BecomeProvider = lazy(() => import('./pages/BecomeProvider'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const WhyUs = lazy(() => import('./pages/WhyUs'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const MyBookings = lazy(() => import('./pages/customer/MyBookings'));
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'));
const NearMe = lazy(() => import('./pages/customer/NearMe'));
const Booking = lazy(() => import('./pages/Booking'));
const Payment = lazy(() => import('./pages/Payment'));
const ProviderDashboard = lazy(() => import('./pages/provider/Dashboard'));
const AddService = lazy(() => import('./pages/provider/AddService'));
const EditService = lazy(() => import('./pages/provider/EditService'));
const MyServices = lazy(() => import('./pages/provider/MyServices'));
const ProviderBookings = lazy(() => import('./pages/provider/ProviderBookings'));
const CompletedJobs = lazy(() => import('./pages/provider/CompletedJobs'));
const ProviderProfile = lazy(() => import('./pages/provider/ProviderProfile'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));

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
            <Suspense fallback={<LoadingSpinner />}>
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
            </Suspense>
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
