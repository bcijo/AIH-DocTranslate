import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const PatientDetails = () => {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);

  // Fetch patients from Firestore
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsCollection = collection(db, 'patients'); // Assuming collection name is "patients"
        const patientDocs = await getDocs(patientsCollection);
        const patientData = patientDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientData);
        if (patientData.length > 0) {
          setActivePatient(patientData[0]); // Set the first patient as active by default
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  return (
    <Container>
      <TabContainer>
        {patients.map(patient => (
          <Tab
            key={patient.id}
            onClick={() => setActivePatient(patient)}
            active={activePatient?.id === patient.id}
          >
            {patient.name} {/* Assuming patients have a "name" field */}
          </Tab>
        ))}
      </TabContainer>
      <DetailsContainer>
        {activePatient ? (
          <>
            <h2>{activePatient.name}</h2>
            <p><strong>Age:</strong> {activePatient.age}</p> {/* Replace fields as per your schema */}
            <p><strong>Condition:</strong> {activePatient.condition}</p>
          </>
        ) : (
          <p>No patient selected</p>
        )}
      </DetailsContainer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  background: #f7f9ff;
  padding: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  background: ${({ active }) => (active ? '#e0e7ff' : 'transparent')};
  color: ${({ active }) => (active ? '#5a6ea1' : '#7f91f7')};
  border-radius: 5px;
  margin-right: 10px;
  box-shadow: ${({ active }) =>
    active ? '0px 4px 8px rgba(0, 0, 0, 0.2)' : '0px 2px 4px rgba(0, 0, 0, 0.1)'};
  transition: box-shadow 0.3s ease, background 0.3s ease;

  &:hover {
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const DetailsContainer = styled.div`
  flex: 1;
  padding: 20px;
  background: #fff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

export default PatientDetails;