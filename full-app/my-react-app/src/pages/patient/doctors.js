import React, { useState } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';

function Doctor() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('telugu');
  const [synth, setSynth] = useState(window.speechSynthesis);
  const [utterance, setUtterance] = useState(null);

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
        text: summary,
        target_lang: selectedLanguage,
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
    recognition.lang = 'en-US';

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

  // Speak translated text
  const handleSpeak = () => {
    if (!translatedText) return;

    const newUtterance = new SpeechSynthesisUtterance(translatedText);
    newUtterance.lang = getLanguageCode(selectedLanguage);
    synth.cancel(); // Stop any ongoing speech
    synth.speak(newUtterance);
    setUtterance(newUtterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synth) synth.cancel();
    setUtterance(null);
  };

  // Language code mapper
  const getLanguageCode = (language) => {
    const languageMap = {
      telugu: 'te-IN',
      kannada: 'kn-IN',
      tamil: 'ta-IN',
      malayalam: 'ml-IN',
      hindi: 'hi-IN',
    };
    return languageMap[language] || 'en-US';
  };

  const containerStyle = {
    margin: '20px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  };

  return (
    <div style={containerStyle}>
      <h2>Patient Translator & Summarizer</h2>
      <textarea
        placeholder="Enter text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={6}
        style={{ width: '80%', marginBottom: '10px', padding: '10px' }}
      />
      <div>
        <FaMicrophone
          size={30}
          style={{ margin: '10px', cursor: 'pointer', color: recognitionActive ? 'red' : 'black' }}
          onClick={recognitionActive ? stopVoiceInput : startVoiceInput}
        />
        <FaStop
          size={30}
          style={{ margin: '10px', cursor: 'pointer', color: 'black' }}
          onClick={stopSpeaking}
        />
        <FaVolumeUp
          size={30}
          style={{ margin: '10px', cursor: 'pointer', color: 'black' }}
          onClick={handleSpeak}
        />
      </div>
      <div>
        <button onClick={handleSummarize} disabled={loading}>
          Summarize
        </button>
        <button onClick={handleTranslate} disabled={loading}>
          Translate
        </button>
      </div>
      <div>
        <label htmlFor="languageSelect">Select Language:</label>
        <select id="languageSelect" value={selectedLanguage} onChange={handleLanguageChange}>
          <option value="telugu">Telugu</option>
          <option value="kannada">Kannada</option>
          <option value="tamil">Tamil</option>
          <option value="malayalam">Malayalam</option>
          <option value="hindi">Hindi</option>
        </select>
      </div>
      {summary && <p>Summary: {summary}</p>}
      {translatedText && <p>Translated Text: {translatedText}</p>}
    </div>
  );
}

export default Doctor;


