import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';
import styled, { createGlobalStyle } from 'styled-components';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/AuthProvider';

function Patient() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [synth, setSynth] = useState(window.speechSynthesis);
  const [utterance, setUtterance] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorSummary, setDoctorSummary] = useState('');
  const [medicationPrescription, setMedicationPrescription] = useState('');
  const [step, setStep] = useState(1); // 1: Patient summary, 2: Doctor summary, 3: Medication prescription
  const [successMessage, setSuccessMessage] = useState('');
  const [recognition, setRecognition] = useState(null);

  const { user } = useAuth(); // Get the authenticated user

  // Fetch patients from Firestore
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsCollection = collection(db, 'patients'); // Assuming collection name is "patients"
        const patientDocs = await getDocs(patientsCollection);
        const patientData = patientDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientData);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on the search query
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle language selection
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  // Function to summarize text using the Flask backend
  const handleSummarize = async (text) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/summarize', {
        text: text,
      });
      if (step === 1) {
        setSummary(response.data.summary);
      } else if (step === 2) {
        setDoctorSummary(response.data.summary);
      } else if (step === 3) {
        setMedicationPrescription(response.data.summary);
      }
    } catch (error) {
      console.error('Summarization Error:', error);
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
    const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = true; // Allow continuous recognition
    recognitionInstance.interimResults = true; // Allow interim results

    recognitionInstance.onstart = () => {
      setRecognitionActive(true);
      console.log('Speech recognition started.');
    };

    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setInputText(event.results[i][0].transcript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      console.log(`You said: ${interimTranscript}`);
    };

    recognitionInstance.onend = () => {
      if (recognitionActive) {
        recognitionInstance.start(); // Restart recognition if it was manually stopped
      }
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
  };

  // Stop voice input
  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
      setRecognitionActive(false);
      console.log('Speech recognition manually stopped.');
      handleSummarize(inputText);
      setInputText(''); // Clear input text after summarization
      setStep(step + 1); // Move to the next step
    }
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

  // Function to save visit details to Firestore
  const saveVisitDetails = async () => {
    try {
      const visitsCollection = collection(db, 'visits');
      await addDoc(visitsCollection, {
        DoctorID: user.uid,
        PatientID: activePatient.id,
        PatientName: activePatient.name,
        PatientCondition: summary,
        DoctorRecommendation: doctorSummary,
        MedicationPrescription: medicationPrescription,
        VisitDate: new Date().toISOString(),
        VisitType: 'in-person',
      });
      setSuccessMessage('Visit details saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving visit details:', error);
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setInputText('');
    setTranslatedText('');
    setSummary('');
    setDoctorSummary('');
    setMedicationPrescription('');
    setStep(1);
    setActivePatient(null);
    setSearchQuery('');
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <ContentContainer>
          <LeftContainer>
            <Title>Doctor Translator & Summarizer</Title>
            <IconContainer>
              <IconCircle onClick={recognitionActive ? stopVoiceInput : startVoiceInput}>
                <StyledIcon as={FaMicrophone} size={30} active={recognitionActive} />
              </IconCircle>
              <IconCircle onClick={stopSpeaking}>
                <StyledIcon as={FaStop} size={30} />
              </IconCircle>
              <IconCircle onClick={handleSpeak}>
                <StyledIcon as={FaVolumeUp} size={30} />
              </IconCircle>
            </IconContainer>
            {step === 1 && <ResultText>Record Patient Problem</ResultText>}
            {step === 2 && <ResultText>Record Doctor Feedback</ResultText>}
            {step === 3 && <ResultText>Record Medication Prescribed</ResultText>}
            {summary && <ResultText>Patient Summary: {summary}</ResultText>}
            {doctorSummary && <ResultText>Doctor Summary: {doctorSummary}</ResultText>}
            {medicationPrescription && <ResultText>Medication Prescription: {medicationPrescription}</ResultText>}
            {translatedText && <ResultText>Translated Text: {translatedText}</ResultText>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
            <ButtonContainer>
              <Button onClick={saveVisitDetails} disabled={loading || step < 4}>
                Save Visit Details
              </Button>
            </ButtonContainer>
          </LeftContainer>
          <RightContainer>
            {activePatient && <PatientName>{activePatient.name}</PatientName>}
            <SearchBar
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <PatientList>
              {filteredPatients.map(patient => (
                <PatientItem
                  key={patient.id}
                  onClick={() => setActivePatient(patient)}
                  active={activePatient?.id === patient.id}
                >
                  {patient.name}
                </PatientItem>
              ))}
            </PatientList>
          </RightContainer>
        </ContentContainer>
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

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const LeftContainer = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RightContainer = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
`;

const Title = styled.h2`
  color: #3a4d99;
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
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

const SuccessMessage = styled.p`
  color: green;
  margin: 15px 0;
  padding: 10px;
  background-color: rgba(0, 255, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled.input`
  width: 90%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
`;

const PatientList = styled.div`
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  background: #f7f9ff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PatientItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
  background: ${({ active }) => (active ? '#e0e7ff' : 'transparent')};
  color: ${({ active }) => (active ? '#5a6ea1' : '#7f91f7')};
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: ${({ active }) =>
    active ? '0px 4px 8px rgba(0, 0, 0, 0.2)' : '0px 2px 4px rgba(0, 0, 0, 0.1)'};
  transition: box-shadow 0.3s ease, background 0.3s ease;

  &:hover {
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const PatientName = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3a4d99;
  margin-bottom: 20px;
  text-align: right;
`;

export default Patient;