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
            <Name>{patient.name}</Name>
            <Age>Age: {patient.age}</Age>
          </Tab>
        ))}
      </TabContainer>
      <DetailsContainer>
        {activePatient ? (
          <>
            <h2>{activePatient.name}</h2>
            <p><strong>Age:</strong> {activePatient.age}</p>
            <p><strong>Condition:</strong> {activePatient.condition}</p>
            <h3>Previous Visits</h3>
            <VisitsList>
              {activePatient.visits && activePatient.visits.length > 0 ? (
                activePatient.visits.map((visit, index) => (
                  <VisitItem key={index}>
                    <strong>Date:</strong> {visit.date}<br />
                    <strong>Reason:</strong> {visit.reason}
                  </VisitItem>
                ))
              ) : (
                <p>No previous visits</p>
              )}
            </VisitsList>
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
  height: 100%;
  width: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #f7f9ff;
  padding: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  width: 600px;
`;

const Tab = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  cursor: pointer;
  background: ${({ active }) => (active ? '#e0e7ff' : 'transparent')};
  color: ${({ active }) => (active ? '#5a6ea1' : '#7f91f7')};
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: ${({ active }) =>
    active ? '0px 4px 8px rgba(0, 0, 0, 0.2)' : '0px 2px 4px rgba(0, 0, 0, 0.1)'};
  transition: box-shadow 0.3s ease, background 0.3s ease;

  &:hover {
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const Name = styled.div`
  flex: 1;
  font-weight: bold;
  text-align: left;
`;

const Age = styled.div`
  flex: 1;
  text-align: right;
`;

const DetailsContainer = styled.div`
  flex: 1;
  padding: 20px;
  background: #fff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const VisitsList = styled.div`
  margin-top: 20px;
`;

const VisitItem = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background: #f7f9ff;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

export default PatientDetails;