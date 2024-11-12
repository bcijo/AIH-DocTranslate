import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import Login from './components/Login';
import DoctorHomePage from './pages/doctor/home';
import PatientHomePage from './pages/patient/home';

// Main App component
function App() {
  const { user } = useAuth(); // Get the current authenticated user
  const [error, setError] = useState('');

  // Debugging: Log the user object and role
  useEffect(() => {
    console.log('Current user:', user);
    if (user && !user.role) {
      setError('User role is missing.');
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

  // If the role is not found, show an error message and allow user to go back to login
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
  if (user.role === 'doctor') {
    return <DoctorHomePage />; // Redirect to Doctor's HomePage
  }

  if (user.role === 'patient') {
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