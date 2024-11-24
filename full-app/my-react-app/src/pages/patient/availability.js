// import React from 'react';
// import styled, { createGlobalStyle } from 'styled-components';
// import axios from 'axios';

// function Availability() {
//   const handleCallNow = async () => {
//     try {
//       const response = await axios.post('http://localhost:5000/make-call');
//       alert(response.data.message); // Show the alert when the call is successfully initiated
//     } catch (error) {
//       console.error('Error initiating call:', error);
//       alert('Failed to initiate call');
//     }
//   };

//   return (
//     <>
//       <GlobalStyle />
//       <Container>
//         <CallButton onClick={handleCallNow}>Call Now</CallButton>
//       </Container>
//     </>
//   );
// }

// const GlobalStyle = createGlobalStyle`
//   body {
//     margin: 0;
//     padding: 0;
//     font-family: 'Arial', sans-serif;
//     background: linear-gradient(135deg, #d8e9ff 0%, #ffeef8 100%);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     height: 100vh;
//   }
// `;

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   height: 100vh;
// `;

// const CallButton = styled.button`
//   padding: 15px 30px;
//   background-color: #3a4d99;
//   color: white;
//   border: none;
//   border-radius: 8px;
//   font-size: 1.2rem;
//   cursor: pointer;
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

//   &:hover {
//     background-color: #5569af;
//   }
// `;

// export default Availability;

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

  const handleCallNow = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/make-call');
      alert(response.data.message); // Show the alert when the call is successfully initiated
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to initiate call');
    }
  };

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  // Helper function to format Firestore timestamps
  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
      return date.toLocaleString(); // Format as human-readable date/time
    }
    return 'Invalid timestamp';
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Doctor Availability</Title>

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
    <h2>{selectedDoctor}</h2>
    <h3>Sessions:</h3>
    <SessionTable>
      <thead>
        <tr>
          <th>Start Time</th>
          <th>End Time</th>
        </tr>
      </thead>
      <tbody>
        {doctors
          .find(doc => doc.name === selectedDoctor)
          ?.sessions.reduce((rows, session, index, array) => {
            if (index % 2 === 0 && index + 1 < array.length) {
              rows.push({
                startTime: formatTimestamp(array[index]),
                endTime: formatTimestamp(array[index + 1]),
              });
            }
            return rows;
          }, [])
          .map((row, index) => (
            <tr key={index}>
              <td>{row.startTime}</td>
              <td>{row.endTime}</td>
            </tr>
          ))}
      </tbody>
    </SessionTable>

    {(() => {
      const currentTime = new Date(); // Current time
      const isAvailable = doctors
        .find(doc => doc.name === selectedDoctor)
        ?.sessions.reduce((availability, session, index, array) => {
          if (index % 2 === 0 && index + 1 < array.length) {
            const startTime = new Date(array[index].seconds * 1000); // Convert Firestore timestamp to Date
            const endTime = new Date(array[index + 1].seconds * 1000); // Convert Firestore timestamp to Date
            if (currentTime >= startTime && currentTime <= endTime) {
              availability = true;
            }
          }
          return availability;
        }, false);

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
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #3a4d99;
`;

const Select = styled.select`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #3a4d99;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const DoctorInfo = styled.div`
  text-align: center;
  color: #333;

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

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  th {
    background-color: #f4f4f4;
    color: #333;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;
const AvailabilityText = styled.p`
  color: ${(props) => (props.isAvailable ? 'green' : 'red')};
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 20px;
`;

export default Availability;
