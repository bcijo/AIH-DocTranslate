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

    // Filter out the initial empty string and process the remaining sessions
    const validSessions = doctorInfo.sessions?.filter(session => session !== "");

    const formattedSessions = validSessions?.map((session) => {
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
            {validSessions && validSessions.length === 0 ? (
                <NoAppointmentsMessage>No appointments so far</NoAppointmentsMessage>
            ) : (
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