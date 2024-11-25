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
            doctorInfo.sessions.slice(index * 2, index * 2 + 2)
        );

        try {
            const docRef = doc(db, 'doctors', user.uid);

            // Remove the selected sessions from Firestore
            await updateDoc(docRef, {
                sessions: arrayRemove(...sessionsToRemove),
            });

            // Update local state
            setDoctorInfo((prev) => ({
                ...prev,
                sessions: prev.sessions.filter((_, index) =>
                    !selectedSessionIndices.some(selectedIndex =>
                        index >= selectedIndex * 2 && index < selectedIndex * 2 + 2
                    )
                ),
            }));

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
            {doctorInfo.sessions && (
                <SessionsTable>
                    <h4>Your Current Sessions</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Select session to remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionPairs.map((session, index) => (
                                <tr key={index}>
                                    <td>{session.startTime}</td>
                                    <td>{session.endTime}</td>
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
                <Button onClick={handleSubmitSessions}>Submit Sessions</Button>
            </SubmitSection>
            <RemoveSection>
                <Button onClick={handleRemoveSession}>Remove Session</Button>
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
    text-align: center;

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

const RemoveSection = styled.div`
    margin-top: 20px;
`;

export default Appointments;
