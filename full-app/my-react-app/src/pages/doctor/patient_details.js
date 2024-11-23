import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const PatientDetails = () => {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visits, setVisits] = useState([]);
  const [expandedVisits, setExpandedVisits] = useState({});
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

  // Fetch visits for the active patient
  useEffect(() => {
    const fetchVisits = async () => {
      if (activePatient) {
        try {
          const visitsCollection = collection(db, 'visits');
          const visitsQuery = await getDocs(visitsCollection);
          const visitsData = visitsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const patientVisits = visitsData.filter(visit => visit.PatientID === activePatient.id);
          setVisits(patientVisits);
        } catch (error) {
          console.error('Error fetching visits:', error);
        }
      }
    };

    fetchVisits();
  }, [activePatient]);

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

  // Toggle the expanded state for a specific visit
  const toggleExpand = (visitId) => {
    setExpandedVisits(prevState => ({
      ...prevState,
      [visitId]: !prevState[visitId]
    }));
  };

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
              {visits.length > 0 ? (
                visits.map((visit, index) => (
                  <React.Fragment key={index}>
                    <VisitItem>
                      <VisitContent>
                        <strong>Date:</strong> {visit.VisitDate}<br />
                        <strong>Reason:</strong> {visit.DoctorRecommendation}
                      </VisitContent>
                      <ExpandButton onClick={() => toggleExpand(visit.id)}>
                        {expandedVisits[visit.id] ? 'Collapse' : 'Expand'}
                      </ExpandButton>
                    </VisitItem>
                    {expandedVisits[visit.id] && (
                      <ExpandedDetails>
                        <DetailItem>
                          <strong>Patient Condition:</strong> {visit.PatientCondition}
                        </DetailItem>
                        <DetailItem>
                          <strong>Doctor Recommendation:</strong> {visit.DoctorRecommendation}
                        </DetailItem>
                        <DetailItem>
                          <strong>Medication Prescription:</strong> {visit.MedicationPrescription}
                        </DetailItem>
                      </ExpandedDetails>
                    )}
                  </React.Fragment>
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
  max-height: 600px; /* Set a maximum height for scrolling */
  width: ${({ activePatient }) => (activePatient ? '40%' : '60%')};
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
  width: 50%;
  padding: 20px;
  background: #ffe6f2; /* Light shade of pink */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  max-height: 60%; /* Set a maximum height for scrolling */
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: #f7f9ff;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const VisitContent = styled.div`
  flex: 1;
`;

const ExpandButton = styled.button`
  padding: 5px 10px;
  width: 20%;
  background: #7f91f7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #5a6ea1;
  }
`;

const ExpandedDetails = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #e0e7ff;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const DetailItem = styled.div`
  margin-bottom: 10px;
`;

export default PatientDetails;