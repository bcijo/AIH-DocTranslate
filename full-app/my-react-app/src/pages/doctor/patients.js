import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';
import styled, { createGlobalStyle } from 'styled-components';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/AuthProvider';

function Patient() {
  const [patientProblem, setPatientProblem] = useState('');
  const [doctorFeedback, setDoctorFeedback] = useState('');
  const [medicationPrescription, setMedicationPrescription] = useState('');
  const [translatedPatientProblem, setTranslatedPatientProblem] = useState('');
  const [translatedDoctorFeedback, setTranslatedDoctorFeedback] = useState('');
  const [translatedMedicationPrescription, setTranslatedMedicationPrescription] = useState('');
  const [medicationSummary, setMedicationSummary] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [patientLanguage, setPatientLanguage] = useState('tamil');
  const [doctorLanguage, setDoctorLanguage] = useState('english');
  const [synth, setSynth] = useState(window.speechSynthesis);
  const [utterance, setUtterance] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorSummary, setDoctorSummary] = useState('');
  const [step, setStep] = useState(1); // 1: Patient summary, 2: Doctor summary, 3: Medication prescription
  const [successMessage, setSuccessMessage] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [finalSummary, setFinalSummary] = useState({
    patientSummary: '',
    doctorSummary: '',
    medicationSummary: ''
  });

  const languageMap = {
    telugu: 'te-IN',
    hindi: 'hi-IN',
    tamil: 'ta-IN',
    malayalam: 'ml-IN',
    kannada: 'kn-IN',
    english: 'en-US'
  };

  const gttsLanguageMap = {
    telugu: 'te',
    hindi: 'hi',
    tamil: 'ta',
    malayalam: 'ml',
    kannada: 'kn',
    english: 'en'
  };

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
    setPatientLanguage(e.target.value);
  };

  // Function to translate text using a translation API
  const translateText = async (text, targetLanguage) => {
    try {
      const response = await axios.post('http://localhost:5000/api/translate', {
        text: text,
        target_lang: targetLanguage,
      });
      return response.data.translated_text;
    } catch (error) {
      console.error('Translation Error:', error);
      return '';
    }
  };

  // Function to summarize text using the Flask backend
  const handleSummarize = async (text) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/summarize', {
        text: text,
      });
      return response.data.summary;
    } catch (error) {
      console.error('Summarization Error:', error);
      return '';
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
    recognitionInstance.lang = step === 1 ? languageMap[patientLanguage] : 'en-US';
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
          if (step === 1) {
            setPatientProblem(event.results[i][0].transcript);
          } else if (step === 2) {
            setDoctorFeedback(event.results[i][0].transcript);
          } else if (step === 3) {
            setMedicationPrescription(event.results[i][0].transcript);
          }
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
    }
  };

  // Handle translate button click
  const handleTranslate = async () => {
    let textToTranslate = '';
    let target = '';
    if (step === 1) {
      textToTranslate = patientProblem;
      target = doctorLanguage;
      const translated = await translateText(textToTranslate, target);
      setTranslatedPatientProblem(translated);
    } else if (step === 2) { 
      const summarizedText = await handleSummarize(doctorFeedback);
      setDoctorSummary(summarizedText);
      textToTranslate = summarizedText;
      target = patientLanguage;
      const translated = await translateText(textToTranslate, target);
      setTranslatedDoctorFeedback(translated);
      await handleSpeak(translated);
    } else if (step === 3) {
      const summarizedText = await handleSummarize(medicationPrescription);
      setMedicationSummary(summarizedText);
      textToTranslate = summarizedText;
      target = patientLanguage;
      const translated = await translateText(textToTranslate, target);
      setTranslatedMedicationPrescription(translated);
      await handleSpeak(translated);
    }
  };

  // Handle summarize button click
  const handleSummarizeClick = async () => {
    let textToSummarize = '';
    if (step === 2) {
      textToSummarize = doctorFeedback;
      const summarizedText = await handleSummarize(textToSummarize);
      setDoctorSummary(summarizedText);
    } else if (step === 3) {
      textToSummarize = medicationPrescription;
      const summarizedText = await handleSummarize(textToSummarize);
      setMedicationSummary(summarizedText);
    }
    setStep(step + 1); // Move to the next step
  };

  // Speak out translated text
  const handleSpeak = async (text) => {
    if (!text) return;

    try {
      const response = await axios.post('http://localhost:5000/api/speak', {
        text: text,
        lang: getLanguageCode(step),
      });

      console.log(response.data.message);
    } catch (error) {
      console.error('Speech Error:', error);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synth) synth.cancel();
    setUtterance(null);
  };

  // Language code mapper
  const getLanguageCode = (step) => {
    const languageMap = {
      1: 'en', // English for step 1
      2: gttsLanguageMap[patientLanguage], // Patient's preferred language for step 2
      3: gttsLanguageMap[patientLanguage], // Patient's preferred language for step 3
    };
    return languageMap[step] || 'en-US';
  };

  // Function to save visit details to Firestore
  const saveVisitDetails = async () => {
    try {
      const visitsCollection = collection(db, 'visits');
      await addDoc(visitsCollection, {
        DoctorID: user.uid,
        PatientID: activePatient.id,
        PatientName: activePatient.name,
        PatientCondition: translatedPatientProblem,
        DoctorRecommendation: doctorFeedback,
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
    setPatientProblem('');
    setDoctorFeedback('');
    setMedicationPrescription('');
    setMedicationSummary('');
    setTranslatedPatientProblem('');
    setTranslatedDoctorFeedback('');
    setTranslatedMedicationPrescription('');
    setSummary('');
    setDoctorSummary('');
    setStep(1);
    setActivePatient(null);
    setSearchQuery('');
  };

  // Handle step transition
  const handleNextStep = () => {
    setStep(step + 1);
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
              <IconCircle onClick={() => handleSpeak(translatedPatientProblem)}>
                <StyledIcon as={FaVolumeUp} size={30} />
              </IconCircle>
            </IconContainer>
            <LanguageDropdown value={patientLanguage} onChange={handleLanguageChange}>
              <option value="telugu">Telugu</option>
              <option value="hindi">Hindi</option>
              <option value="tamil">Tamil</option>
              <option value="malayalam">Malayalam</option>
              <option value="kannada">Kannada</option>
              <option value="english">English</option>
            </LanguageDropdown>
            <Textbox
              value={step === 1 ? patientProblem : step === 2 ? doctorFeedback : medicationPrescription}
              onChange={(e) => {
                if (step === 1) {
                  setPatientProblem(e.target.value);
                } else if (step === 2) {
                  setDoctorFeedback(e.target.value);
                } else if (step === 3) {
                  setMedicationPrescription(e.target.value);
                }
              }}
              placeholder="Transcribed text will appear here..."
            />
            <ButtonContainer>
              {step === 1 && (
                <Button onClick={handleTranslate} disabled={loading}>
                  Translate
                </Button>
              )}
              {(step === 2 || step === 3) && (
                <>
                 
                  <Button onClick={handleTranslate} disabled={loading}>
                    Summarise & Translate
                  </Button>
                </>
              )}
              <Button onClick={handleNextStep} disabled={loading || step >= 4}>
                Next Step
              </Button>
            </ButtonContainer>
            {step === 1 && <ResultText>Record Patient Problem</ResultText>}
            {step === 2 && <ResultText>Record Doctor Feedback</ResultText>}
            {step === 3 && <ResultText>Record Medication Prescription</ResultText>}
            {doctorSummary && <ResultText>Doctor Summary: {doctorSummary}</ResultText>}
            {medicationSummary && <ResultText>Medication Prescription Summary: {medicationSummary}</ResultText>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
            {step === 4 && (
              <>
                <ResultText>Patient Problem: {translatedPatientProblem}</ResultText>
                <ResultText>Doctor Feedback: {translatedDoctorFeedback}</ResultText>
                <ResultText>Medication Prescription: {translatedMedicationPrescription}</ResultText>
              </>
            )}
            <ButtonContainer>
              <Button onClick={saveVisitDetails} disabled={loading || step < 4}>
                Save Visit Details
              </Button>
            </ButtonContainer>
          </LeftContainer>
          <RightContainer>
            {activePatient ? (
              <PatientInfo>
                <PatientName>{activePatient.name}</PatientName>
                <PatientAge>Age: {activePatient.age}</PatientAge>
              </PatientInfo>
            ) : (
              <SelectPatientText>Select a patient</SelectPatientText>
            )}
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

const LanguageDropdown = styled.select`
  margin: 15px 0;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Textbox = styled.textarea`
  width: 90%;
  height: 100px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
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
  max-height: 70%;
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

const PatientInfo = styled.div`
  text-align: right;
  margin-bottom: 20px;
`;

const PatientName = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3a4d99;
`;

const PatientAge = styled.div`
  font-size: 1rem;
  color: #3a4d99;
`;

const SelectPatientText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3a4d99;
  text-align: right;
  margin-bottom: 20px;
`;

export default Patient;

