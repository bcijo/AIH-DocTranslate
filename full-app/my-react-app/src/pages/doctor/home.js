// src/pages/doctor/home.js
import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import UserProfile from '../../components/UserProfile';
import Patient from './patients'; // Import the Patient component

const DoctorHomePage = () => {
    return (
        <div style={{ backgroundColor: '#F5F5DC', padding: '20px', minHeight: '100vh' }}>
            <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Link to="/doctor/home" style={{ color: '#E07B39' }}>Home</Link>
                <Link to="/doctor/patients" style={{ color: '#E07B39' }}>Patients</Link>
                <Link to="/doctor/appointments" style={{ color: '#E07B39' }}>Appointments</Link>
            </nav>
            
            <UserProfile />

            <Routes>
                <Route
                    path="/doctor/home"
                    element={
                        <div>
                            <h1 style={{ color: '#DCE4C9' }}>Welcome, Doctor</h1>
                            <p style={{ color: '#B6A28E' }}>
                                This is your dashboard where you can manage appointments and view patient information.
                            </p>
                        </div>
                    }
                />
                <Route path="/doctor/patients" element={<Patient />} />
            </Routes>
        </div>
    );
};

export default DoctorHomePage;