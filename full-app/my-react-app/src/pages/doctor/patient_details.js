import React, { useState, useEffect } from 'react';

const PatientDetails = ({ match }) => {
    const { id } = match.params; // Retrieve patient ID from URL
    const [visits, setVisits] = useState([]);

    useEffect(() => {
        // Fetch visit details by patient ID
        // setVisits(response.data);
    }, [id]);

    return (
        <div>
            <h2>Patient Details</h2>
            <ul>
                {visits.map((visit, index) => (
                    <li key={index}>
                        <h3>Visit on {visit.date}</h3>
                        <p><strong>Patient Summary:</strong> {visit.patientSummary}</p>
                        <p><strong>Doctor Summary:</strong> {visit.doctorSummary}</p>
                        <p><strong>Prescribed Medicines:</strong> {visit.medicines.join(', ')}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PatientDetails;