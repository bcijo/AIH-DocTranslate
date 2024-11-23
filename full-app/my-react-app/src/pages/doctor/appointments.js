//-------------------------------------with scroll---------------------------------------------------------------------------
// import React, { useEffect, useState } from 'react';
// import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
// import { db } from '../../config/firebaseConfig'; // Adjust path if necessary
// import { useAuth } from '../../hooks/AuthProvider'; // Assuming AuthProvider handles user authentication

// const Appointments = () => {
//     const { user } = useAuth(); // Retrieve authenticated user information
//     const [doctorInfo, setDoctorInfo] = useState(null); // Store doctor data
//     const [loading, setLoading] = useState(true); // Loading state for fetching doctor info
//     const [sessions, setSessions] = useState([]); // Manage multiple session inputs

//     useEffect(() => {
//         // Fetch doctor information from Firestore
//         const fetchDoctorInfo = async () => {
//             if (user && user.uid) {
//                 try {
//                     const docRef = doc(db, 'doctors', user.uid);
//                     const docSnap = await getDoc(docRef);

//                     if (docSnap.exists()) {
//                         setDoctorInfo(docSnap.data());
//                     } else {
//                         console.log('No doctor information found.');
//                     }
//                 } catch (error) {
//                     console.error('Error fetching doctor information:', error);
//                 } finally {
//                     setLoading(false);
//                 }
//             }
//         };

//         fetchDoctorInfo();
//     }, [user]);

//     const handleAddNewSessionInput = () => {
//         // Add a new empty session input
//         setSessions([...sessions, { startTime: '', endTime: '' }]);
//     };

//     const handleSessionChange = (index, field, value) => {
//         // Update the start time or end time for a specific session
//         const updatedSessions = [...sessions];
//         updatedSessions[index][field] = value;
//         setSessions(updatedSessions);
//     };

//     const handleSubmitSessions = async () => {
//         try {
//             const docRef = doc(db, 'doctors', user.uid);
//             const sessionTimestamps = sessions.flatMap(({ startTime, endTime }) => [
//                 Timestamp.fromDate(new Date(startTime)),
//                 Timestamp.fromDate(new Date(endTime)),
//             ]);

//             // Update Firestore document with all session timestamps
//             await updateDoc(docRef, {
//                 sessions: arrayUnion(...sessionTimestamps),
//             });

//             // Update local state to include new sessions
//             setDoctorInfo((prev) => ({
//                 ...prev,
//                 sessions: [...(prev?.sessions || []), ...sessionTimestamps],
//             }));

//             // Clear session inputs
//             setSessions([]);
//         } catch (error) {
//             console.error('Error submitting sessions:', error);
//         }
//     };

//     if (loading) {
//         return <p>Loading doctor information...</p>;
//     }

//     if (!doctorInfo) {
//         return <p>No doctor information found.</p>;
//     }

//     // Format the session timestamps into readable strings and display in a table format
//     const formattedSessions = doctorInfo.sessions?.map((session, index) => {
//         const date = new Date(session.seconds * 1000);
//         return date.toLocaleString(); // Converts the timestamp to a readable date format
//     });

//     // Organize sessions in pairs for start time and end time
//     const sessionPairs = [];
//     for (let i = 0; i < formattedSessions.length; i += 2) {
//         sessionPairs.push({
//             startTime: formattedSessions[i],
//             endTime: formattedSessions[i + 1] || 'N/A', // If there's an odd number of sessions, mark the end time as 'N/A'
//         });
//     }

//     return (
//         <div style={{ height: '100vh', overflowY: 'auto' }}> {/* Added scrollable container */}
//             <h1>Appointments</h1>
//             <p>Manage your appointments here.</p>

//             <div>
//                 <h3>Doctor Information</h3>
//                 <p><strong>Name:</strong> {doctorInfo.name}</p>
//                 <p><strong>Email:</strong> {doctorInfo.email}</p>
//                 <p><strong>Phone Number:</strong> {doctorInfo.phoneNumber}</p>
//                 <p><strong>Department:</strong> {doctorInfo.department}</p>
//                 <p><strong>Hospital:</strong> {doctorInfo.hospital}</p>

//                 {/* Render sessions in a table format */}
//                 {doctorInfo.sessions && (
//                     <div>
//                         <h4>Your Current Sessions</h4>
//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>Start Time</th>
//                                     <th>End Time</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {sessionPairs.map((session, index) => (
//                                     <tr key={index}>
//                                         <td>{session.startTime}</td>
//                                         <td>{session.endTime}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}

//                 {/* Add new session inputs */}
//                 <div>
//                     <h4>Set your Available Sessions</h4>
//                     {sessions.map((session, index) => (
//                         <div key={index} style={{ marginBottom: '10px' }}>
//                             <label>Start Time</label>
//                             <input
//                                 type="datetime-local"
//                                 value={session.startTime}
//                                 onChange={(e) =>
//                                     handleSessionChange(index, 'startTime', e.target.value)
//                                 }
//                                 placeholder="Start Time"
//                                 style={{ marginRight: '10px' }}
//                             />
//                             <label>End Time</label>
//                             <input
//                                 type="datetime-local"
//                                 value={session.endTime}
//                                 onChange={(e) =>
//                                     handleSessionChange(index, 'endTime', e.target.value)
//                                 }
//                                 placeholder="End Time"
//                             />
//                         </div>
//                     ))}
//                     <button onClick={handleAddNewSessionInput} style={{ marginTop: '10px' }}>
//                         Enter New Session
//                     </button>
//                 </div>

//                 {/* Submit all sessions */}
//                 <div style={{ marginTop: '20px' }}>
//                     <button onClick={handleSubmitSessions}>Submit Sessions</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Appointments;
//---------------------------------------------------------------------------------------------------------------
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../hooks/AuthProvider';
import styled from 'styled-components';

const Appointments = () => {
    const { user } = useAuth();
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
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
        setSessions([...sessions, { startTime: '', endTime: '' }]);
    };

    const handleSessionChange = (index, field, value) => {
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

            await updateDoc(docRef, {
                sessions: arrayUnion(...sessionTimestamps),
            });

            setDoctorInfo((prev) => ({
                ...prev,
                sessions: [...(prev?.sessions || []), ...sessionTimestamps],
            }));

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

    const formattedSessions = doctorInfo.sessions?.map((session) => {
        const date = new Date(session.seconds * 1000);
        return date.toLocaleString();
    });

    const sessionPairs = [];
    for (let i = 0; i < formattedSessions.length; i += 2) {
        sessionPairs.push({
            startTime: formattedSessions[i],
            endTime: formattedSessions[i + 1] || 'N/A',
        });
    }

    return (
        <Container>
            <Title>Appointments</Title>
            {/* <Description>Manage your appointments here.</Description> */}

            {/* <DoctorInfo>
                <h3>Doctor Information</h3>
                <p><strong>Name:</strong> {doctorInfo.name}</p>
                <p><strong>Email:</strong> {doctorInfo.email}</p>
                <p><strong>Phone Number:</strong> {doctorInfo.phoneNumber}</p>
                <p><strong>Department:</strong> {doctorInfo.department}</p>
                <p><strong>Hospital:</strong> {doctorInfo.hospital}</p>
            </DoctorInfo> */}

            {doctorInfo.sessions && (
                <SessionsTable>
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
                </SessionsTable>
            )}

            <SessionForm>
                <h4>Set your Available Sessions</h4>
                {sessions.map((session, index) => (
                    <SessionInput key={index}>
                        <label>Start Time</label>
                        <input
                            type="datetime-local"
                            value={session.startTime}
                            onChange={(e) =>
                                handleSessionChange(index, 'startTime', e.target.value)
                            }
                            placeholder="Start Time"
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
                    </SessionInput>
                ))}
                <Button onClick={handleAddNewSessionInput}>Enter New Session</Button>
            </SessionForm>

            <SubmitSection>
                <Button onClick={handleSubmitSessions}>Submit Sessions</Button>
            </SubmitSection>
        </Container>
    );
};

const Container = styled.div`
    height: 100vh;
    overflow-y: auto;
    padding: 20px;
    background: linear-gradient(135deg, #d8e9ff 0%, #ffeef8 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Title = styled.h1`
    color: #3a4d99;
`;

const Description = styled.p`
    font-size: 1.2rem;
    color: #333;
`;

const DoctorInfo = styled.div`
    text-align: center;
    color: #333;
    margin-bottom: 20px;
`;

const SessionsTable = styled.div`
    margin-bottom: 20px;
    text-align: center; /* Add this line to center the content */

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 1rem;
        text-align: left;
        border: 1px solid #ddd;
    }

    th, td {
        padding: 8px;
        border: 1px solid #ddd;
    }

    th {
        background-color: #f4f4f4;
        color: #333;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    tr:hover {
        background-color: #f1f1f1;
    }
`;


const SessionForm = styled.div`
    width: 100%;
    max-width: 600px;
    margin-top: 20px;
    text-align: center;
`;

const SessionInput = styled.div`
    margin-bottom: 10px;
    
    label {
        display: block;
        margin-bottom: 5px;
    }
    
    input {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
    }
`;

const Button = styled.button`
    padding: 15px 30px;
    background-color: #3a4d99;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.2rem;
    cursor: pointer;
    margin-top: 10px;

    &:hover {
        background-color: #5569af;
    }
`;

const SubmitSection = styled.div`
    margin-top: 20px;
`;

export default Appointments;
