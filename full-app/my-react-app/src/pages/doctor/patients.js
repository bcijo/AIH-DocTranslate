import React, { useState } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';
import styled, { createGlobalStyle } from 'styled-components';


function Patient() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english'); // Default to English

  // Language map for speech recognition
  const languageMap = {
    telugu: 'te-IN',
    hindi: 'hi-IN',
    tamil: 'ta-IN',
    malayalam: 'ml-IN',
    kannada: 'kn-IN',
    english: 'en-US',
  };

  // Function to handle language selection
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  // Function to summarize text using the Flask backend
  const handleSummarize = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/summarize', {
        text: inputText,
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Summarization Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to translate summarized text using the Flask backend
  const handleTranslate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/translate', {
        text: inputText,
        target_lang: 'english', // Always translate to English
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error('Translation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start voice input
  const startVoiceInput = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = languageMap[selectedLanguage]; // Set language based on selectedLanguage

    recognition.onstart = () => {
      setRecognitionActive(true);
      console.log('Speech recognition started.');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(`You said: ${transcript}`);
      setInputText(transcript);
    };

    recognition.onend = () => {
      setRecognitionActive(false);
      console.log('Speech recognition stopped.');
    };

    recognition.start();
  };

  // Stop voice input
  const stopVoiceInput = () => {
    setRecognitionActive(false);
    console.log('Speech recognition manually stopped.');
  };

  // Speak translated text using the Flask backend
  const handleSpeak = async () => {
    if (!translatedText) return;

    try {
      const response = await axios.post('http://localhost:5000/api/speak', {
        text: translatedText,
        lang: 'en', // Always speak in English
      });

      console.log(response.data.message); // Log successful start of speech
    } catch (error) {
      console.error('Speech Error:', error);
    }
  };

  // Stop speech using the Flask backend
  const handleStopSpeech = async () => {
    try {
      await axios.post('http://localhost:5000/api/stop-speech');
      console.log('Speech stopped');
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Doctor Translator & Summarizer</Title>
        <TextArea
          placeholder="Enter text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
        />
        <IconContainer>
          <IconCircle onClick={recognitionActive ? stopVoiceInput : startVoiceInput}>
            <StyledIcon as={FaMicrophone} 
              size={30} 
              active={recognitionActive}
            />
          </IconCircle>
          <IconCircle onClick={stopSpeaking}>
            <StyledIcon as={FaStop} 
              size={30} 
            />
          </IconCircle>
          <IconCircle onClick={handleSpeak}>
            <StyledIcon as={FaVolumeUp} 
              size={30} 
            />
          </IconCircle>
        </IconContainer>
        <ButtonContainer>
          <Button onClick={handleSummarize} disabled={loading}>
            Summarize
          </Button>
          <Button onClick={handleTranslate} disabled={loading}>
            Translate
          </Button>
        </ButtonContainer>
        
        {summary && <ResultText>Summary: {summary}</ResultText>}
        {translatedText && <ResultText>Translated Text: {translatedText}</ResultText>}
      </Container>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #d8e9ff 0%, #ffeef8 100%);
  min-height: 100vh;
`;

const Title = styled.h2`
  color: #3a4d99;
  font-size: 2rem;
  margin-bottom: 20px;
`;

const TextArea = styled.textarea`
  width: 80%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #7f91f7;
  border-radius: 8px;
  resize: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 15px 0;
  gap: 20px;
`;

const IconCircle = styled.div`
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
`;

const StyledIcon = styled.div`
  color: ${props => props.active ? 'red' : '#5569af'};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 15px;
  background: linear-gradient(90deg, #7f91f7, #a5b8ff);
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background: linear-gradient(90deg, #a5b8ff, #7f91f7);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultText = styled.p`
  color: #5569af;
  margin: 15px 0;
  padding: 10px;
  background-color: rgba(127, 145, 247, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export default Patient;
