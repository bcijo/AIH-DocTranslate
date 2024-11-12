// src/pages/doctor/home.js
import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../../components/UserProfile'; // Import UserProfile component

const DoctorHomePage = () => {
    return (
        <div>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/doctor/home">Home</Link>
                    <Link to="/doctor/patients">Patients</Link>
                    <Link to="/doctor/appointments">Appointments</Link>
                </div>
                <UserProfile /> {/* Add UserProfile component for logout */}
            </nav>

            <h1>Welcome, Doctor</h1>
            <p>This is your dashboard where you can manage your appointments and view patient information.</p>
            {/* Add additional content or widgets here */}
        </div>
    );
};

export default DoctorHomePage;