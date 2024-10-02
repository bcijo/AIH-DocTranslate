import React, { useState } from 'react';
import { FaMicrophone, FaArrowLeft, FaVolumeUp } from 'react-icons/fa';
import { Button } from '@mui/material';
import styled from 'styled-components';

import LanguageSelector from './components/LanguageSelector';
import useRecorder from './hooks/useRecorder';  // Import the useRecorder hook

function App() {
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [availableLanguages] = useState(['English', 'Tamil', 'Telugu', 'Kannada']);
  
  const [audioURL, isRecording, startRecording, stopRecording] = useRecorder();  // Using the hook

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <AppContainer>
      <Header>
        <FaArrowLeft />
        <Title>Patient</Title>
      </Header>
      
      <MainContent>
        <MicrophoneContainer onClick={handleRecord}>
          <FaMicrophone size={100} style={{ color: isRecording ? 'red' : 'black' }} />
          <p>{isRecording ? 'Recording...' : 'Tap to speak'}</p>
        </MicrophoneContainer>

        {audioURL && (
          <audio controls>
            <source src={audioURL} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        )}

        <ButtonContainer>
          <StyledButton variant="contained" color="primary">Transcribe</StyledButton>
          <StyledButton variant="contained" color="primary">Detect Language</StyledButton>
        </ButtonContainer>

        <DetectedLanguage>
          {detectedLanguage ? `Language Detected: ${detectedLanguage}` : 'Detect Language First'}
        </DetectedLanguage>

        <LanguageSelector languages={availableLanguages} />

        <StyledButton variant="contained" color="primary">Translate</StyledButton>
      </MainContent>

      <Footer>
        <FaVolumeUp size={30} />
      </Footer>
    </AppContainer>
  );
}

// Styled components for layout
const AppContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100vh;
  justify-content: space-between;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
`;

const Title = styled.h1`
  flex-grow: 1;
  text-align: center;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const MicrophoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const StyledButton = styled(Button)`
  width: 250px;
`;

const DetectedLanguage = styled.p`
  font-size: 16px;
  color: gray;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 10px;
`;

export default App;