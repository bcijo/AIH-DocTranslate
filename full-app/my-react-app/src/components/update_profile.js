// src/components/UpdateProfile.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/AuthProvider'; 
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';


const UpdateProfile = () => {
  const { role } = useParams();
  const { user } = useAuth(); //
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    department: '', // Specific to doctor
    email: '',
    hospital: '', // Specific to doctor
    name: '',
    phoneNumber: '',
    userId: '',
    age: '', // Specific to patient
    height: '', // Specific to patient
    weight: '', // Specific to patient
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  
  useEffect(() => {
    fetchUserData();
  }, [role, user]);

  const fetchUserData = async () => {
    try {
      // Validate user and role
      if (!user) {
        navigate('/login');
        return;
      }

      // Determine the Firestore collection based on role
      const collectionName = role === 'doctor' ? 'doctors' : 'patients';
      
      // Reference to the user's document in Firestore
      const userDocRef = doc(db, collectionName, user.uid);

      // Fetch the document
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Fetched user data:', data);

        // Pre-fill form with fetched data based on role
        const updatedFormData = role === 'doctor' 
          ? {
              department: data.department || '', 
              email: data.email || user.email,
              hospital: data.hospital || '', 
              name: data.name || user.displayName || '',
              phoneNumber: data.phoneNumber || '',
              userId: user.uid,
            }
          : {
              email: data.email || user.email,
              name: data.name || user.displayName || '',
              phoneNumber: data.phoneNumber || '',
              userId: user.uid,
              age: data.age || '', 
              height: data.height || '', 
              weight: data.weight || '', 
            };

        setFormData(updatedFormData);
      } else {
        console.warn('No document found for user');
        // Optionally, set some default values or show a message
      }

      setIsLoading(false);
    } catch (error) {
      console.error(`Error fetching ${role} profile:`, error);
      setError(error.message);
      setIsLoading(false);
      alert('Failed to fetch profile. Please try again.');
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(''); // Clear any previous success messages

    try {
      const collectionName = role === 'doctor' ? 'doctors' : 'patients';
      const userDocRef = doc(db, collectionName, user.uid);

      await updateDoc(userDocRef, formData);

      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ProfileCard>
        <Title>Update {role === 'doctor' ? 'Doctor' : 'Patient'} Profile</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </FormGroup>

          {role === 'doctor' && (
            <>
              <FormGroup>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter your department"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="hospital">Hospital</Label>
                <Input
                  id="hospital"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="Enter your hospital"
                  required
                />
              </FormGroup>
            </>
          )}

          {role === 'patient' && (
            <>
              <FormGroup>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Enter your height"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Enter your weight"
                  required
                />
              </FormGroup>
            </>
          )}

          <FormGroup>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="Enter your user ID"
              required
              disabled
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </FormGroup>

          <ButtonWrapper>
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </SubmitButton>
          </ButtonWrapper>

          {/* New success message component */}
          {successMessage && (
            <SuccessMessage>
              {successMessage}
            </SuccessMessage>
          )}

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}
        </Form>
      </ProfileCard>
    </Container>
  );
};

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(180deg, #f1f5ff 0%, #ffeef8 100%);
  min-height: 100vh; // Use 100vh to cover full viewport height
  width: 100%; // Ensure full width
  position: fixed; // Position fixed to overlay entire screen
  top: 0;
  left: 0;
  overflow-y: auto; // Allow vertical scrolling if content exceeds viewport
`;

const ProfileCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh; // Limit max height to 90% of viewport
  overflow-y: auto; // Add vertical scrollbar if content is too long
  margin: auto; // Center the card
`;

const SuccessMessage = styled.div`
  background-color: #e6f7e9;
  color: #2e8b57;
  border: 1px solid #2e8b57;
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
`;

// Optional styled component for error message
const ErrorMessage = styled.div`
  background-color: #fff0f0;
  color: #d9534f;
  border: 1px solid #d9534f;
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 70vh; // Limit form height
  overflow-y: auto; // Add scrollbar to form if needed
`;

const Title = styled.h2`
  color: #3a4d99;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
`;


const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #5569af;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #7f91f7;
    box-shadow: 0 0 0 2px rgba(127, 145, 247, 0.2);
  }

  &:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(90deg, #7f91f7, #a5b8ff);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #a5b8ff, #7f91f7);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export default UpdateProfile;
