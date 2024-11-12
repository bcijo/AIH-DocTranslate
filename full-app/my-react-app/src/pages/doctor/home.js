import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Link to="/doctor/home">Home</Link>
                <Link to="/doctor/patients">Patients</Link>
                <Link to="/doctor/appointments">Appointments</Link>
            </nav>

            <h1>Welcome, Doctor</h1>
            <p>This is your dashboard where you can manage your appointments and view patient information.</p>
            {/* Add additional content or widgets here */}
        </div>
    );
};

export default Home;
