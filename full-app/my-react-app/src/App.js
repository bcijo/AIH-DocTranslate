import React, { useState } from 'react';
import styled from 'styled-components';
import useRecorder from './hooks/useRecorder';
import LanguageSelector from './components/LanguageSelector';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import Login from './components/Login';
import UserProfile from './components/UserProfile';

import Patient from './pages/doctor/patients'; // Import the Patient component

function App() {
  return (
    <div className="App">
      <Patient /> {/* Render the Patient component */}
    </div>
  );
}

export default App;
