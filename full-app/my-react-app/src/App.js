import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { signOut } from 'firebase/auth';
// import { auth } from './config/firebaseConfig';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import Login from './components/Login';
import DoctorHomePage from './pages/doctor/home';
import PatientHomePage from './pages/patient/home';
import DoctorForm from './components/DoctorForm';
import PatientForm from './components/PatientForm';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth(); // Get the current authenticated user
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (user) {
      console.log('Current user state:', {
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        path: location.pathname
      });
    }
  }, [user, location]);

  // const handleLogout = () => {
  //   signOut(auth).catch((error) => {
  //     console.error('Error signing out:', error);
  //     setError('Failed to log out. Please try again.');
  //   });
  // };

  // If no user is logged in, show the Login page
  if (!user) {
    return <Login />;
  }

  // Add this debug log to help understand the values
  console.log('User state:', {
    role: user.role,
    isProfileComplete: user.isProfileComplete
  });

  return (
    <Routes>
      <Route path="/" element={
        user.isProfileComplete ? (
          <Navigate to={`/${user.role?.toLowerCase()}/home`} replace />
        ) : (
          user.role === 'Doctor' ? (
            <Navigate to="/doctor/form" replace />
          ) : (
            <Navigate to="/patient/form" replace />
          )
        )
      } />
      
      <Route
        path="/doctor/form"
        element={
          <ProtectedRoute requiredRole="Doctor">
            {user.isProfileComplete ? (
              <Navigate to="/doctor/home" replace />
            ) : (
              <DoctorForm user={user} />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/form"
        element={
          <ProtectedRoute requiredRole="Patient">
            {user.isProfileComplete ? (
              <Navigate to="/patient/home" replace />
            ) : (
              <PatientForm user={user} />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute requiredRole="Doctor">
            {!user.isProfileComplete && location.state?.isProfileComplete !== true ? (
              <Navigate to="/doctor/form" replace />
            ) : (
              <DoctorHomePage />
            )}
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute requiredRole="Patient">
            {!user.isProfileComplete && location.state?.isProfileComplete !== true ? (
              <Navigate to="/patient/form" replace />
            ) : (
              <PatientHomePage />
            )}
          </ProtectedRoute>
        }
      />

      {/* Default route for invalid paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
