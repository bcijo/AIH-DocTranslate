// src/pages/patient/home.js
import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../../components/UserProfile'; // Import UserProfile component
import { Routes, Route } from 'react-router-dom';
import Doctor from './doctors';


const PatientHomePage = () => {
    return (
            <div style={{ backgroundColor: '#F5F5DC', padding: '20px', minHeight: '100vh' }}>
            <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <Link to="/patient/home">Home</Link>
                    <Link to="/patient/doctors">Doctors</Link>
                    <Link to="/patient/availability">Doctor Availability</Link>
                
                <UserProfile /> {/* Add UserProfile component for logout */}
            </nav>

            <Routes>
                <Route
                    path="/patient/home"
                    element={
                        <div>
                            <h1 style={{ color: '#DCE4C9' }}>Welcome, Patient</h1>
                            <p style={{ color: '#B6A28E' }}>
                                This is your dashboard where you can manage availabilityof doctors and view doctor information.
                            </p>
                        </div>
                    }
                />
                <Route path="/patient/doctors" element={<Doctor />} />
            </Routes>
        </div>
    );
};

export default PatientHomePage;