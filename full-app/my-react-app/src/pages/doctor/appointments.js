import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../hooks/AuthProvider';
import styled from 'styled-components';

const Appointments = () => {
    const { user } = useAuth();
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [selectedSessionIndices, setSelectedSessionIndices] = useState([]);

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
        const currentTime = new Date();

        // Validate each session's start and end times
        for (const { startTime, endTime } of sessions) {
            if (!startTime || !endTime) {
                console.error('Both start time and end time must be filled.');
                alert('Please fill out both start and end times for all sessions.');
                return;
            }

            const start = new Date(startTime);
            const end = new Date(endTime);

            if (start < currentTime) {
                console.error('Start time must be greater than the current time.');
                alert('Start time must be greater than the current time.');
                return;
            }

            if (start >= end) {
                console.error('Start time must be earlier than end time.');
                alert('Start time must be earlier than end time for all sessions.');
                return;
            }
        }

        try {
            const docRef = doc(db, 'doctors', user.uid);

            // Convert sessions to Firestore Timestamps
            const sessionTimestamps = sessions.flatMap(({ startTime, endTime }) => [
                Timestamp.fromDate(new Date(startTime)),
                Timestamp.fromDate(new Date(endTime)),
            ]);

            // Update Firestore with new sessions
            await updateDoc(docRef, {
                sessions: arrayUnion(...sessionTimestamps),
            });

            // Update local state
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

    const handleRemoveSession = async () => {
        if (selectedSessionIndices.length === 0) {
            alert('Please select at least one session to remove.');
            return;
        }

        const sessionsToRemove = selectedSessionIndices.flatMap(index =>
            doctorInfo.sessions.slice(index * 2 + 2, index * 2 + 4)
        );

        try {
            const docRef = doc(db, 'doctors', user.uid);

            // Remove the selected sessions from Firestore
            await updateDoc(docRef, {
                sessions: arrayRemove(...sessionsToRemove),
            });

            // Update local state
            setDoctorInfo((prev) => {
                const updatedSessions = prev.sessions.filter((_, index) =>
                    !selectedSessionIndices.some(selectedIndex =>
                        index >= selectedIndex * 2 + 2 && index < selectedIndex * 2 + 4
                    )
                );
                return {
                    ...prev,
                    sessions: updatedSessions,
                };
            });

            // Clear selected session indices
            setSelectedSessionIndices([]);
        } catch (error) {
            console.error('Error removing sessions:', error);
        }
    };

    const toggleSessionSelection = (index) => {
        setSelectedSessionIndices((prevSelected) =>
            prevSelected.includes(index)
                ? prevSelected.filter((i) => i !== index)
                : [...prevSelected, index]
        );
    };

    if (loading) {
        return <p>Loading doctor information...</p>;
    }

    if (!doctorInfo) {
        return <p>No doctor information found.</p>;
    }

    // Check if the first session is an empty string
    const hasInitialEmptyString = doctorInfo.sessions && doctorInfo.sessions[0] === "";

    // Filter out the initial empty string and process the remaining sessions
    const validSessions = hasInitialEmptyString
        ? doctorInfo.sessions.slice(1).filter(session => session !== "")
        : doctorInfo.sessions.filter(session => session !== "");

    const formatSessionTime = (startTime, endTime) => {
        const start = new Date(startTime.seconds * 1000);
        const end = new Date(endTime.seconds * 1000);
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const dateOptions = { day: 'numeric', month: 'short' };
        return `${start.toLocaleDateString([], dateOptions)}: ${start.toLocaleTimeString([], options)} - ${end.toLocaleDateString([], dateOptions)}: ${end.toLocaleTimeString([], options)}`;
    };

    const sessionPairs = [];
    for (let i = 0; i < validSessions.length; i += 2) {
        sessionPairs.push({
            startTime: validSessions[i],
            endTime: validSessions[i + 1] || null,
        });
    }

    return (
        <Container>
            <Title>Appointments</Title>
            {validSessions && validSessions.length === 0 ? (
                <NoAppointmentsMessage>No appointments so far</NoAppointmentsMessage>
            ) : (
                <SessionsTable>
                    <h4>Your Current Sessions</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Session</th>
                                <th>Select session to remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionPairs.map((session, index) => (
                                <tr key={index}>
                                    <td>{formatSessionTime(session.startTime, session.endTime)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSessionIndices.includes(index)}
                                            onChange={() => toggleSessionSelection(index)}
                                        />
                                    </td>
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
                <Button onClick={handleSubmitSessions}>Submit New Sessions</Button>
            </SubmitSection>
            <RemoveSection>
                <Button onClick={handleRemoveSession}>Remove Chosen Session</Button>
            </RemoveSection>
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
    color: #3a4d99;
    font-family: 'Arial', sans-serif;
`;

const Title = styled.h1`
    color: #3a4d99;
    font-family: 'Arial', sans-serif;
`;

const Description = styled.p`
    font-size: 1.2rem;
    color: #3a4d99;
    font-family: 'Arial', sans-serif;
`;

const DoctorInfo = styled.div`
    text-align: center;
    color: #3a4d99;
    margin-bottom: 20px;
    font-family: 'Arial', sans-serif;
`;

const SessionsTable = styled.div`
    margin-bottom: 20px;
    text-align: center;
    font-family: 'Arial', sans-serif;

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
        color: #3a4d99;
    }

    th {
        background-color: #f4f4f4;
        color: #3a4d99;
        text-align: center; /* Center the column heading text */
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    tr:hover {
        background-color: #f1f1f1;
    }
`;

const NoAppointmentsMessage = styled.p`
    font-size: 1.2rem;
    color: #00008B; /* Dark blue color */
    font-weight: bold;
    margin-top: 20px;
`;

const SessionForm = styled.div`
    width: 100%;
    max-width: 600px;
    margin-top: 20px;
    text-align: center;
    font-family: 'Arial', sans-serif;
`;

const SessionInput = styled.div`
    margin-bottom: 10px;

    label {
        display: block;
        margin-bottom: 5px;
        color: #3a4d99;
        font-family: 'Arial', sans-serif;
    }

    input {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        color: #3a4d99;
        font-family: 'Arial', sans-serif;
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
    font-family: 'Arial', sans-serif;

    &:hover {
        background-color: #5569af;
    }
`;

const SubmitSection = styled.div`
    margin-top: 20px;
`;

const RemoveSection = styled.div`
    margin-top: 20px;
`;

export default Appointments;