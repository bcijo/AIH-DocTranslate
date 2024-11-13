import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import Login from './components/Login';
import DoctorHomePage from './pages/doctor/home';
import PatientHomePage from './pages/patient/home';
import DoctorForm from './components/DoctorForm';
import PatientForm from './components/PatientForm';

function App() {
  const { user } = useAuth(); // Get the current authenticated user
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      console.log('Current user:', user);
    }
  }, [user]);

  // Handle logout and redirect to login page
  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error('Error signing out:', error);
      setError('Failed to log out. Please try again.');
    });
  };

  // If no user is logged in, show the Login page
  if (!user) {
    return <Login />;
  }

  // Show appropriate form if profile is not complete
  if (user.role && !user.isProfileComplete) {
    if (user.role === 'Doctor') {
      return <DoctorForm user={user} />;
    }
    if (user.role === 'Patient') {
      return <PatientForm user={user} />;
    }
  }

  // Show role not found error
  if (!user.role) {
    return (
      <div>
        <h1>Role not found</h1>
        <button onClick={handleLogout}>Go Back to Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  // Based on the user role, redirect to the appropriate homepage
  if (user.role === 'Doctor') {
    return <DoctorHomePage />; // Redirect to Doctor's HomePage
  }

  if (user.role === 'Patient') {
    return <PatientHomePage />; // Redirect to Patient's HomePage
  }

  // Default return if no valid role is found
  return (
    <div>
      <h1>Role not found. Please contact support.</h1>
      <button onClick={handleLogout}>Go Back to Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
