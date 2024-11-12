import React from 'react';
import { Link } from 'react-router-dom';

const PatientHomePage = () => {
    return (
        <div>
            <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Link to="/patient/home">Home</Link>
                <Link to="/patient/doctors">Doctors</Link>
                <Link to="/patient/availability">Doctor Availability</Link>
            </nav>

            <h1>Welcome, Patient</h1>
            <p>This is your dashboard where you can manage your appointments and view patient information.</p>
            {/* Add additional content or widgets here */}
        </div>
    );
};

export default PatientHomePage;
