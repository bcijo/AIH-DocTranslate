import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const PatientDetails = () => {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Fetch patients from Firestore
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsCollection = collection(db, 'patients'); // Assuming collection name is "patients"
        const patientDocs = await getDocs(patientsCollection);
        const patientData = patientDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientData);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on the search query
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle clicks outside the patient list and details container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActivePatient(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <Heading>Patient Details</Heading>
      <SearchBar
        type="text"
        placeholder="Search patients..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ContentContainer>
        <TabContainer activePatient={activePatient}>
          {filteredPatients.map(patient => (
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
        {activePatient && (
          <DetailsContainer>
            <PatientHeader>
              <Name>{activePatient.name}</Name>
              <Age>Age: {activePatient.age}</Age>
            </PatientHeader>
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
          </DetailsContainer>
        )}
      </ContentContainer>
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

const Heading = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #3a4d99;
`;

const SearchBar = styled.input`
  width: 50%;
  padding: 10px;
  margin: 20px auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #f7f9ff;
  padding: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  width: ${({ activePatient }) => (activePatient ? '40%' : '40%')};
  margin-right: ${({ activePatient }) => (activePatient ? '20px' : '0')};
  transition: width 0.3s ease, margin-right 0.3s ease;
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
  width: 800px;
  padding: 20px;
  background: #ffe6f2; /* Light shade of pink */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow-y: auto;
  color: #5a6ea1; /* Purple text */
`;

const PatientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
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