// src/components/Login.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { auth } from '../config/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>{isSignUp ? 'Welcome to DocTranslate' : 'Welcome Back at DocTranslate'}</Title>
        <Subtitle>
          {isSignUp 
            ? 'Please sign up to continue' 
            : 'Please login to continue'
          }
        </Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </InputGroup>

          <Button type="submit">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <Divider>or</Divider>

          <GoogleButton type="button" onClick={handleGoogleSignIn}>
            <GoogleIcon src="/google_icon.jpg" alt="Google" />
            Continue with Google
          </GoogleButton>

          <ToggleText>
            {isSignUp 
              ? 'Already have an account? ' 
              : "Don't have an account? "
            }
            <ToggleLink onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </ToggleLink>
          </ToggleText>
        </Form>
      </FormCard>
    </Container>
  );
};

// Styled Components
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

  &:hover {
    background-color: #0056b3;
  }
`;

const GoogleButton = styled(Button)`
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const GoogleIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const Divider = styled.div`
  text-align: center;
  position: relative;
  color: #666;
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background-color: #ddd;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
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

const ToggleText = styled.p`
  text-align: center;
  font-size: 14px;
  color: #666;
`;

const ToggleLink = styled.span`
  color: #007bff;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export default Login;