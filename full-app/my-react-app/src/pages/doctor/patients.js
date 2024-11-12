import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Patients = () => {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        // Fetch patients data here from an API or local data source
        // setPatients(response.data);
    }, []);

    return (
        <div>
            <h2>Patients</h2>
            <ul>
                {patients.map((patient) => (
                    <li key={patient.id}>
                        <Link to={`/doctor/patient/${patient.id}`}>{patient.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Patients;
