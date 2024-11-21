import React, { useState } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';

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
    <div style={styles.container}>
      <h2>Patient Translate</h2>
      <select 
        value={selectedLanguage} 
        onChange={handleLanguageChange} 
        style={styles.select}
      >
        <option value="english">English</option>
        <option value="telugu">Telugu</option>
        <option value="hindi">Hindi</option>
        <option value="tamil">Tamil</option>
        <option value="malayalam">Malayalam</option>
        <option value="kannada">Kannada</option>
      </select>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text for translation or voice input"
        rows="4"
        cols="50"
        style={styles.textarea}
      />
      <br />
      <div style={styles.buttonContainer}>
        <button onClick={handleTranslate} disabled={loading} style={styles.button}>Translate</button>
      </div>

      {translatedText && (
        <div>
          <h3>Translated Text:</h3>
          <p>{translatedText}</p>
        </div>
      )}

      <br />
      <div style={styles.voiceContainer}>
        {recognitionActive ? (
          <button onClick={stopVoiceInput} style={styles.voiceButton}><FaStop /> Stop</button>
        ) : (
          <button onClick={startVoiceInput} style={styles.voiceButton}><FaMicrophone /> Start</button>
        )}
        <button onClick={handleSpeak} style={styles.voiceButton}><FaVolumeUp /> Speak</button>
        <button onClick={handleStopSpeech} style={styles.voiceButton}><FaStop /> Stop Speech</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
  },
  textarea: {
    width: '80%',
    maxWidth: '600px',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    margin: '10px 0',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    backgroundColor: '#007BFF', // Blue button color
    color: 'white',
    border: 'none',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    margin: '10px 0',
  },
  voiceContainer: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginTop: '20px',
  },
  voiceButton: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    backgroundColor: '#007BFF', // Blue button color
    color: 'white',
    border: 'none',
  },
};

export default Patient;
