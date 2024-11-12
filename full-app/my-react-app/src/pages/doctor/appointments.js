import React, { useState } from 'react';

const Appointments = () => {
    const [slots, setSlots] = useState([]);
    const [newSlot, setNewSlot] = useState('');

    const addSlot = () => {
        setSlots([...slots, newSlot]);
        setNewSlot('');
    };

    return (
        <div>
            <h2>Appointment Scheduling</h2>
            <input 
                type="text" 
                value={newSlot} 
                onChange={(e) => setNewSlot(e.target.value)} 
                placeholder="Enter available time slot" 
            />
            <button onClick={addSlot}>Add Slot</button>
            <h3>Available Slots:</h3>
            <ul>
                {slots.map((slot, index) => (
                    <li key={index}>{slot}</li>
                ))}
            </ul>
        </div>
    );
};

export default Appointments;