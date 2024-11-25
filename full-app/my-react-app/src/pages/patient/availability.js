import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import { collection, getDocs } from 'firebase/firestore'; // Firestore functions
import { db } from '../../config/firebaseConfig'; // Ensure the path is correct
import { useAuth } from '../../hooks/AuthProvider'; // Assuming you're using AuthProvider for user info

function Availability() {
  const { user } = useAuth(); // Fetch authenticated user info
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  useEffect(() => {
    // Fetch doctors from Firestore
    const fetchDoctors = async () => {
      if (user && user.uid) {
        try {
          const doctorsRef = collection(db, 'doctors');
          const doctorsSnap = await getDocs(doctorsRef);
          const doctorsList = doctorsSnap.docs.map(doc => doc.data());
          setDoctors(doctorsList);
        } catch (error) {
          console.error('Error fetching doctors:', error);
        }
      }
    };

    fetchDoctors();
  }, [user]);

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const handleCallNow = async () => {
    const selectedDoctorData = doctors.find(doc => doc.name === selectedDoctor);
    if (selectedDoctorData && selectedDoctorData.phoneNumber) {
      const phoneNumber = `+91${selectedDoctorData.phoneNumber}`;
      try {
        const response = await axios.post('http://127.0.0.1:5000/make-call', { phoneNumber });
        alert(response.data.message);
      } catch (error) {
        console.error('Error initiating call:', error);
        alert('Failed to initiate call');
      }
    } else {
      alert('Doctor phone number not available');
    }
  };

  // Helper function to format session times in a human-friendly way
  const formatSessionTime = (startTime, endTime) => {
    const start = new Date(startTime.seconds * 1000);
    const end = new Date(endTime.seconds * 1000);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const dateOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString([], dateOptions)}: ${start.toLocaleTimeString([], options)} - ${end.toLocaleDateString([], dateOptions)}: ${end.toLocaleTimeString([], options)}`;
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Doctor Availability</Title>

        <Label>Choose Doctor</Label>
        <Select onChange={handleDoctorChange} value={selectedDoctor}>
          <option value="">Select a Doctor</option>
          {doctors.map((doctor, index) => (
            <option key={index} value={doctor.name}>
              {doctor.name} - {doctor.specialty}
            </option>
          ))}
        </Select>

        {selectedDoctor && (
          <DoctorInfo>
            <h3>{selectedDoctor}'s Sessions:</h3>
            {(() => {
              const selectedDoctorData = doctors.find(doc => doc.name === selectedDoctor);
              const hasInitialEmptyString = selectedDoctorData.sessions && selectedDoctorData.sessions[0] === "";
              const validSessions = hasInitialEmptyString
                ? selectedDoctorData.sessions.slice(1).filter(session => session !== "")
                : selectedDoctorData.sessions.filter(session => session !== "");

              if (validSessions.length === 0) {
                return <NoSessionsMessage>The doctor does not have any sessions so far.</NoSessionsMessage>;
              }

              return (
                <SessionTable>
                  <thead>
                    <tr>
                      <th>Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validSessions.reduce((rows, session, index, array) => {
                      if (index % 2 === 0 && index + 1 < array.length) {
                        rows.push({
                          startTime: array[index],
                          endTime: array[index + 1],
                        });
                      }
                      return rows;
                    }, []).map((row, index) => (
                      <tr key={index}>
                        <td>{formatSessionTime(row.startTime, row.endTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </SessionTable>
              );
            })()}

            {(() => {
              const selectedDoctorData = doctors.find(doc => doc.name === selectedDoctor);
              const validSessions = selectedDoctorData?.sessions.filter(session => session !== "");
              const currentTime = new Date(); // Current time
              const isAvailable = validSessions.reduce((availability, session, index, array) => {
                if (index % 2 === 0 && index + 1 < array.length) {
                  const startTime = new Date(array[index].seconds * 1000); // Convert Firestore timestamp to Date
                  const endTime = new Date(array[index + 1].seconds * 1000); // Convert Firestore timestamp to Date
                  if (currentTime >= startTime && currentTime <= endTime) {
                    availability = true;
                  }
                }
                return availability;
              }, false);

              if (validSessions.length > 0) {
                if (isAvailable) {
                  return (
                    <>
                      <AvailabilityText isAvailable={true}>Doctor is available</AvailabilityText>
                      <CallButton onClick={handleCallNow}>Call Now</CallButton>
                    </>
                  );
                } else {
                  return <AvailabilityText isAvailable={false}>Doctor is not available</AvailabilityText>;
                }
              }
            })()}
          </DoctorInfo>
        )}
      </Container>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #d8e9ff 0%, #ffeef8 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: #3a4d99;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #3a4d99;
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #3a4d99;
  font-family: 'Arial', sans-serif;
`;

const Label = styled.label`
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #3a4d99;
  font-family: 'Arial', sans-serif;
`;

const Select = styled.select`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #3a4d99;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #3a4d99;
  font-family: 'Arial', sans-serif;
`;

const DoctorInfo = styled.div`
  text-align: center;
  color: #3a4d99;
  font-family: 'Arial', sans-serif;

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin: 5px 0;
    color: #3a4d99;
  }
`;

const CallButton = styled.button`
  padding: 15px 30px;
  background-color: #3a4d99;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  margin-top: 20px;
  font-family: 'Arial', sans-serif;

  &:hover {
    background-color: #5569af;
  }
`;

const SessionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 1rem;
  text-align: left;
  color: #3a4d99;
  font-family: 'Arial', sans-serif;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  th {
    background-color: #f4f4f4;
    color: #3a4d99;
    font-weight: bold;
    text-align: center; /* Center the column header text */
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

const NoSessionsMessage = styled.p`
  font-size: 1.2rem;
  color: #00008B; /* Dark blue color */
  font-weight: bold;
  margin-top: 20px;
  font-family: 'Arial', sans-serif;
`;

const AvailabilityText = styled.p`
  color: ${(props) => (props.isAvailable ? 'green' : 'red')};
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 20px;
  font-family: 'Arial', sans-serif;
`;

export default Availability;