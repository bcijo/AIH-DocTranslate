// src/pages/patient/home.js
import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import UserProfile from '../../components/UserProfile'; // Import UserProfile component
import Doctor from './doctors'; // Import Doctor component

const PatientHomePage = () => {
    return (
        <div style={{ backgroundColor: '#F5F5DC', padding: '20px', minHeight: '100vh' }}>
            <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Link to="home" style={{ color: '#E07B39' }}>Home</Link>
                <Link to="doctors" style={{ color: '#E07B39' }}>Doctors</Link>
                <Link to="availability" style={{ color: '#E07B39' }}>Doctor Availability</Link>
            </nav>

            <UserProfile /> {/* Add UserProfile component for logout */}

            <Routes>
                <Route
                    path="home"
                    element={
                        <div>
                            <h1 style={{ color: '#DCE4C9' }}>Welcome, Patient</h1>
                            <p style={{ color: '#B6A28E' }}>
                                This is your dashboard where you can manage the availability of doctors and view doctor information.
                            </p>
                        </div>
                    }
                />
                <Route path="doctors" element={<Doctor />} />
                <Route
                    path="availability"
                    element={
                        <div>
                            <h2 style={{ color: '#DCE4C9' }}>Doctor Availability</h2>
                            <p style={{ color: '#B6A28E' }}>View available slots for doctors here.</p>
                        </div>
                    }
                />
            </Routes>
        </div>
    );
};

export default PatientHomePage;
