// import React, { useState } from 'react';

// const Appointments = () => {
//     const [slots, setSlots] = useState([]);
//     const [newSlot, setNewSlot] = useState('');                                         

//     const addSlot = () => {
//         setSlots([...slots, newSlot]);
//         setNewSlot('');
//     };

//     return (
//         <div>
//             <h2>Appointment Scheduling</h2>
//             <input 
//                 type="text" 
//                 value={newSlot} 
//                 onChange={(e) => setNewSlot(e.target.value)} 
//                 placeholder="Enter available time slot" 
//             />
//             <button onClick={addSlot}>Add Slot</button>
//             <h3>Available Slots:</h3>
//             <ul>
//                 {slots.map((slot, index) => (
//                     <li key={index}>{slot}</li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default Appointments;


// import React, { useState } from 'react';
// import styled from 'styled-components';

// const Appointments = () => {
//   const [appointments, setAppointments] = useState([
//     { id: 1, name: 'John Doe', date: '2024-11-25', time: '10:30 AM' },
//     { id: 2, name: 'Jane Smith', date: '2024-11-26', time: '2:00 PM' },
//   ]);
//   const [activeAppointment, setActiveAppointment] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   const filteredAppointments = appointments.filter(appointment =>
//     appointment.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Container>
//       <Heading>Appointments</Heading>
//       <SearchBar
//         type="text"
//         placeholder="Search appointments..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//       />
//       <ContentContainer>
//         <TabContainer activeAppointment={activeAppointment}>
//           {filteredAppointments.map(appointment => (
//             <Tab
//               key={appointment.id}
//               onClick={() => setActiveAppointment(appointment)}
//               active={activeAppointment?.id === appointment.id}
//             >
//               <Name>{appointment.name}</Name>
//               <Details>
//                 {appointment.date} - {appointment.time}
//               </Details>
//             </Tab>
//           ))}
//         </TabContainer>
//         {activeAppointment && (
//           <DetailsContainer>
//             <AppointmentHeader>
//               <Name>{activeAppointment.name}</Name>
//               <Details>
//                 {activeAppointment.date} - {activeAppointment.time}
//               </Details>
//             </AppointmentHeader>
//             <p>Details for this appointment will go here.</p>
//           </DetailsContainer>
//         )}
//       </ContentContainer>
//     </Container>
//   );
// };

// // Styled Components
// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   height: 100%;
//   width: 100%;
// `;

// const Heading = styled.h1`
//   text-align: center;
//   margin-bottom: 20px;
//   color: #3a4d99;
// `;

// const SearchBar = styled.input`
//   width: 50%;
//   padding: 10px;
//   margin: 20px auto;
//   border: 1px solid #ccc;
//   border-radius: 5px;
//   font-size: 1rem;
// `;

// const ContentContainer = styled.div`
//   display: flex;
//   flex: 1;
//   justify-content: center;
// `;

// const TabContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   background: #f7f9ff;
//   padding: 10px;
//   box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
//   overflow-y: auto;
//   width: ${({ activeAppointment }) => (activeAppointment ? '40%' : '40%')};
//   margin-right: ${({ activeAppointment }) => (activeAppointment ? '20px' : '0')};
//   transition: width 0.3s ease, margin-right 0.3s ease;
// `;

// const Tab = styled.div`
//   display: flex;
//   justify-content: space-between;
//   padding: 10px 15px;
//   cursor: pointer;
//   background: ${({ active }) => (active ? '#e0e7ff' : 'transparent')};
//   color: ${({ active }) => (active ? '#5a6ea1' : '#7f91f7')};
//   border-radius: 5px;
//   margin-bottom: 10px;
//   box-shadow: ${({ active }) =>
//     active ? '0px 4px 8px rgba(0, 0, 0, 0.2)' : '0px 2px 4px rgba(0, 0, 0, 0.1)'};
//   transition: box-shadow 0.3s ease, background 0.3s ease;

//   &:hover {
//     box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
//   }
// `;

// const Name = styled.div`
//   flex: 1;
//   font-weight: bold;
//   text-align: left;
// `;

// const Details = styled.div`
//   flex: 1;
//   text-align: right;
// `;

// const DetailsContainer = styled.div`
//   width: 800px;
//   padding: 20px;
//   background: #ffe6f2;
//   box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
//   border-radius: 10px;
//   overflow-y: auto;
//   color: #5a6ea1;
// `;

// const AppointmentHeader = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin-bottom: 20px;
// `;

// export default Appointments;

// import React from 'react';

// const Appointments = () => {
//     return (
//         <div>
//             <h1>Appointments</h1>
//             <p>This is where the appointments feature will be implemented.</p>
//         </div>
//     );
// };

// export default Appointments;

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig'; // Adjust path if necessary
import { useAuth } from '../../hooks/AuthProvider'; // Assuming AuthProvider handles user authentication

const Appointments = () => {
    const { user } = useAuth(); // Retrieve authenticated user information
    const [doctorInfo, setDoctorInfo] = useState(null); // Store doctor data
    const [loading, setLoading] = useState(true); // Loading state for fetching doctor info
    const [sessions, setSessions] = useState([]); // Manage multiple session inputs

    useEffect(() => {
        // Fetch doctor information from Firestore
        const fetchDoctorInfo = async () => {
            if (user && user.uid) {
                try {
                    const docRef = doc(db, 'doctors', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setDoctorInfo(docSnap.data());
                    } else {
                        console.log('No doctor information found.');
                    }
                } catch (error) {
                    console.error('Error fetching doctor information:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDoctorInfo();
    }, [user]);

    const handleAddNewSessionInput = () => {
        // Add a new empty session input
        setSessions([...sessions, { startTime: '', endTime: '' }]);
    };

    const handleSessionChange = (index, field, value) => {
        // Update the start time or end time for a specific session
        const updatedSessions = [...sessions];
        updatedSessions[index][field] = value;
        setSessions(updatedSessions);
    };

    const handleSubmitSessions = async () => {
        try {
            const docRef = doc(db, 'doctors', user.uid);
            const sessionTimestamps = sessions.flatMap(({ startTime, endTime }) => [
                Timestamp.fromDate(new Date(startTime)),
                Timestamp.fromDate(new Date(endTime)),
            ]);

            // Update Firestore document with all session timestamps
            await updateDoc(docRef, {
                sessions: arrayUnion(...sessionTimestamps),
            });

            // Update local state to include new sessions
            setDoctorInfo((prev) => ({
                ...prev,
                sessions: [...(prev?.sessions || []), ...sessionTimestamps],
            }));

            // Clear session inputs
            setSessions([]);
        } catch (error) {
            console.error('Error submitting sessions:', error);
        }
    };

    if (loading) {
        return <p>Loading doctor information...</p>;
    }

    if (!doctorInfo) {
        return <p>No doctor information found.</p>;
    }

    // Format the session timestamps into readable strings and display in a table format
    const formattedSessions = doctorInfo.sessions?.map((session, index) => {
        const date = new Date(session.seconds * 1000);
        return date.toLocaleString(); // Converts the timestamp to a readable date format
    });

    // Organize sessions in pairs for start time and end time
    const sessionPairs = [];
    for (let i = 0; i < formattedSessions.length; i += 2) {
        sessionPairs.push({
            startTime: formattedSessions[i],
            endTime: formattedSessions[i + 1] || 'N/A', // If there's an odd number of sessions, mark the end time as 'N/A'
        });
    }

    return (
        <div>
            <h1>Appointments</h1>
            <p>Manage your appointments here.</p>

            <div>
                <h3>Doctor Information</h3>
                <p><strong>Name:</strong> {doctorInfo.name}</p>
                <p><strong>Email:</strong> {doctorInfo.email}</p>
                <p><strong>Phone Number:</strong> {doctorInfo.phoneNumber}</p>
                <p><strong>Department:</strong> {doctorInfo.department}</p>
                <p><strong>Hospital:</strong> {doctorInfo.hospital}</p>

                {/* Render sessions in a table format */}
                {doctorInfo.sessions && (
                    <div>
                        <h4>Your Current Sessions</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessionPairs.map((session, index) => (
                                    <tr key={index}>
                                        <td>{session.startTime}</td>
                                        <td>{session.endTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add new session inputs */}
                <div>
                    <h4>Set your Available Sessions</h4>
                    {sessions.map((session, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                            <label>Start Time</label>
                            <input
                                type="datetime-local"
                                value={session.startTime}
                                onChange={(e) =>
                                    handleSessionChange(index, 'startTime', e.target.value)
                                }
                                placeholder="Start Time"
                                style={{ marginRight: '10px' }}
                            />
                            <label>End Time</label>
                            <input
                                type="datetime-local"
                                value={session.endTime}
                                onChange={(e) =>
                                    handleSessionChange(index, 'endTime', e.target.value)
                                }
                                placeholder="End Time"
                            />
                        </div>
                    ))}
                    <button onClick={handleAddNewSessionInput} style={{ marginTop: '10px' }}>
                        Enter New Session
                    </button>
                </div>

                {/* Submit all sessions */}
                <div style={{ marginTop: '20px' }}>
                    <button onClick={handleSubmitSessions}>Submit Sessions</button>
                </div>
            </div>
        </div>
    );
};

export default Appointments;

