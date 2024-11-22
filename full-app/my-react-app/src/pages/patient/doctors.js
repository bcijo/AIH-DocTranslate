import React, { useState } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';
import styled, { createGlobalStyle } from 'styled-components';

function Doctor() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const languageMap = {
    telugu: 'te-IN',
    hindi: 'hi-IN',
    tamil: 'ta-IN',
    malayalam: 'ml-IN',
    kannada: 'kn-IN',
    english: 'en-US'
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

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

  const handleTranslate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/translate', {
        text: inputText,
        target_lang: selectedLanguage,
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error('Translation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = languageMap[selectedLanguage];

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

  const stopVoiceInput = () => {
    setRecognitionActive(false);
    console.log('Speech recognition manually stopped.');
  };

  const handleSpeak = async () => {
    if (!translatedText) return;

    try {
      const response = await axios.post('http://localhost:5000/api/speak', {
        text: translatedText,
        lang: getLanguageCode(selectedLanguage),
      });

      console.log(response.data.message);
    } catch (error) {
      console.error('Speech Error:', error);
    }
  };

  const handleStopSpeech = async () => {
    try {
      await axios.post('http://localhost:5000/api/stop-speech');
      console.log('Speech stopped');
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  const getLanguageCode = (language) => {
    const languageMap = {
      telugu: 'te',
      hindi: 'hi',
      tamil: 'ta',
      malayalam: 'ml',
      kannada: 'kn',
    };
    return languageMap[language] || 'en';
  };

  return (
    <Container>
      <Title>Patient Translate & Summary</Title>
      <DropdownContainer>
        <select 
          value={selectedLanguage} 
          onChange={handleLanguageChange} 
        >
          <option value="english">English</option>
          <option value="telugu">Telugu</option>
          <option value="hindi">Hindi</option>
          <option value="tamil">Tamil</option>
          <option value="malayalam">Malayalam</option>
          <option value="kannada">Kannada</option>
        </select>
      </DropdownContainer>

      <TextArea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text for translation or voice input"
        rows="4"
        cols="50"
      />
      <IconContainer>
        {recognitionActive ? (
          <IconCircle onClick={stopVoiceInput}>
            <StyledIcon><FaStop /></StyledIcon>
          </IconCircle>
        ) : (
          <IconCircle onClick={startVoiceInput}>
            <StyledIcon><FaMicrophone /></StyledIcon>
          </IconCircle>
        )}
        <IconCircle onClick={handleSpeak}>
          <StyledIcon><FaVolumeUp /></StyledIcon>
        </IconCircle>
        <IconCircle onClick={handleStopSpeech}>
          <StyledIcon><FaStop /></StyledIcon>
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
      {summary && (
        <ResultText>
          <h3>Summary:</h3>
          <p>{summary}</p>
        </ResultText>
      )}

      {translatedText && (
        <ResultText>
          <h3>Translated Text:</h3>
          <p>{translatedText}</p>
        </ResultText>
      )}

      

      
    </Container>
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
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled.h2`
  color: #3a4d99;
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
`;

const TextArea = styled.textarea`
  width: 80%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #7f91f7;
  border-radius: 8px;
  resize: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const DropdownContainer = styled.div`
  margin: 15px 0;
  select {
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #7f91f7;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #3a4d99;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #d0d0d0;
    cursor: not-allowed;
  }
`;

const ResultText = styled.p`
  margin-top: 15px;
  font-size: 1.1rem;
  color: #333;
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
    transform: scale(1.1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
`;

const StyledIcon = styled.div`
  color: ${({ active }) => (active ? '#4caf50' : '#000')};
`;

export default Doctor;




