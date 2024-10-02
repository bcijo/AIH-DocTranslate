import React, { useState } from 'react';
import styled from 'styled-components';
import useRecorder from './hooks/useRecorder';
import LanguageSelector from './components/LanguageSelector';

const languages = ['English', 'Tamil', 'Telugu', 'Kannada'];

function App() {
  const { isRecording, startRecording, stopRecording, audioUrl, audioBlob } = useRecorder();
  const [detectedLanguage, setDetectedLanguage] = useState(''); // State to hold detected language

  const uploadAudio = async () => {
    if (!audioBlob) return; // Ensure there's audio to upload

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav'); // Append the audio blob

    try {
      const response = await fetch('http://127.0.0.1:5000/api/language-detection', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Language Detection Result:', data);
        setDetectedLanguage(data.detected_language || 'Language not detected'); // Update state with detected language
      } else {
        console.error('Error uploading audio:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  return (
    <AppContainer>
      <Title>Patient</Title>

      <MicrophoneContainer>
        <MicrophoneIcon onClick={isRecording ? stopRecording : startRecording}>
          🎤
        </MicrophoneIcon>
        <RecordingText>{isRecording ? 'Recording...' : 'Tap To Speak'}</RecordingText>
      </MicrophoneContainer>

      <Button onClick={uploadAudio}>Detect Language</Button> {/* Trigger upload here */}

      <DetectedLanguage>Language Detected: {detectedLanguage || 'None'}</DetectedLanguage> {/* Show detected language */}

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

// Styled Components for Responsive Design
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  @media (min-width: 1024px) {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
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