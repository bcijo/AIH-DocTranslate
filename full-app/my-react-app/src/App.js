import React, { useState } from 'react';
import styled from 'styled-components';
import useRecorder from './hooks/useRecorder';
import LanguageSelector from './components/LanguageSelector';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import Login from './components/Login';
import UserProfile from './components/UserProfile';

const languages = ['English', 'Tamil', 'Telugu', 'Kannada'];

function MainApp() {
  const { isRecording, startRecording, stopRecording, audioUrl, audioBlob } = useRecorder();
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const { user } = useAuth(); // Move this inside MainApp

  const uploadAudio = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/language-detection', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Language Detection Result:', data);
        setDetectedLanguage(data.detected_language || 'Language not detected');
      } else {
        console.error('Error uploading audio:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  // If no user, return Login component
  if (!user) {
    return <Login />;
  }

  return (
    <AppContainer>
      <Header>
        <Title>
          Patient
        </Title>
        <UserProfile />
      </Header>
      <Title>Patient</Title>
      <MicrophoneContainer>
        <MicrophoneIcon onClick={isRecording ? stopRecording : startRecording}>
          <span role="img" aria-label='microphone'>🎤</span>
        </MicrophoneIcon>
        <RecordingText>{isRecording ? 'Recording...' : 'Tap To Speak'}</RecordingText>
      </MicrophoneContainer>

      <Button onClick={uploadAudio}>Detect Language</Button>
      <DetectedLanguage>Language Detected: {detectedLanguage || 'None'}</DetectedLanguage>
      <LanguageSelector languages={languages} />

      {audioUrl && (
        <AudioPlayer controls>
          <source src={audioUrl} type="audio/wav" />
          Your browser does not support the audio element.
        </AudioPlayer>
      )}
    </AppContainer>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

// Styled Components for Responsive Design
const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (min-width: 1024px) {
    padding: 20px 40px;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;

  @media (min-width: 1024px) {
    padding: 0;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;

  @media (min-width: 1024px) {
    font-size: 2.5rem;
  }
`;

const MicrophoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const MicrophoneIcon = styled.div`
  font-size: 4rem;
  cursor: pointer;

  @media (min-width: 1024px) {
    font-size: 6rem;
  }
`;

const RecordingText = styled.p`
  margin-top: 10px;
  font-size: 1rem;

  @media (min-width: 1024px) {
    font-size: 1.2rem;
  }
`;

const Button = styled.button`
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px 0;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  @media (min-width: 1024px) {
    width: 300px;
    padding: 15px;
    font-size: 1.2rem;
  }
`;

const DetectedLanguage = styled.p`
  font-size: 1rem;
  margin: 20px 0;

  @media (min-width: 1024px) {
    font-size: 1.2rem;
  }
`;

const AudioPlayer = styled.audio`
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
`;

export default App;