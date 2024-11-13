import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const DoctorForm = ({ user }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [hospital, setHospital] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('DoctorForm mounted');
    return () => {
      console.log('DoctorForm unmounted');
    };
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    console.log('Starting form submission...');

    if (!name || !phoneNumber || !department || !hospital) {
        setError('Please fill in all fields.');
        setIsSubmitting(false);
        return;
    }

    try {
        console.log('Saving doctor details...');
        // Save doctor details to Firestore
        await setDoc(doc(db, 'doctors', user.uid), {
          name,
          phoneNumber,
          department,
          hospital,
          userId: user.uid,  // Add this to link with user account
          email: user.email
    });
    console.log('Doctor details saved successfully');

    console.log('Updating user profile...');
    // Update the user's profile completion status
    await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'Doctor',
        isProfileComplete: true,
        doctorProfile: true  // Add this flag
    }, { merge: true });

    console.log('Doctor data saved to Firestore!');

    navigate('/doctor/home', { replace: true, state: { isProfileComplete: true } });

    } catch (error) {
        console.error('Error saving doctor data:', error);
        setError('Failed to save doctor data. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Doctor Information</Title>
        <Subtitle>Please provide your details to complete the sign-up.</Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Phone Number</Label>
            <Input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Department (Area of Expertise)</Label>
            <Input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter your department"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Hospital</Label>
            <Input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="Enter your hospital name"
              required
            />
          </InputGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Doctor Details'}
          </Button>
        </Form>
      </FormCard>
    </Container>
  );
};

// Styled Components (similar to the login page)
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-image: url('/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
`;

const FormCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  text-align: center;

  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c00;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
`;

export default DoctorForm;
