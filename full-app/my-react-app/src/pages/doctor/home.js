import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { NavLink, Route, Routes } from 'react-router-dom';
import UserProfile from '../../components/UserProfile';
import Patient from './patients';
import PatientDetails from './patient_details';
import styled, { keyframes } from 'styled-components';
import Appointments from './appointments'; // Adjust path as necessary

const HeroSectionContent = () => (
  <HeroSection>
    <HeroText>
      <Title>Empowering Your Practice</Title>
      <Subtitle>
        Streamline administrative tasks, access real-time patient data, and enhance patient engagement.
      </Subtitle>
      <Actions>
        <ActionButton primary>Get Started</ActionButton>
        <ActionButton>Learn More</ActionButton>
      </Actions>
    </HeroText>
    <HeroImage src="/doctor.png" alt="Doctor" />
  </HeroSection>
);

const DoctorHomePage = () => {
  return (
    <>
      <GlobalStyle />
      <Container>
        <Navbar>
          <Logo>
            <LogoImage src="/logo2.jpg" alt="DocTranslate Logo" />
            <LogoText>DocTranslate</LogoText>
          </Logo>
          <NavLinks>
            <StyledNavLink to="home">Home</StyledNavLink>
            <StyledNavLink to="sessions">Session</StyledNavLink>
            <StyledNavLink to="patients">Patients</StyledNavLink>
            <StyledNavLink to="appointments">Appointments</StyledNavLink>
          </NavLinks>
          <ProfileButton>
            <UserProfile />
          </ProfileButton>
        </Navbar>

        <Routes>
          {/* Default route and Home route share the same HeroSectionContent */}
          <Route index element={<HeroSectionContent />} />
          <Route path="home" element={<HeroSectionContent />} />
          <Route path="patients" element={<PatientDetails />} />
          <Route path="sessions" element={<Patient />} />
          <Route path="appointments" element={<Appointments />} /> {/* Add this */}
        </Routes>
      </Container>
    </>
  );
};

// Keyframes for animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Global Style to Remove Default Margins and Scrollbars
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }

  #root {
    height: 100%;
    overflow: hidden;
  }
`;

// Styled Components
const Container = styled.div`
  font-family: 'Arial', sans-serif;
  color: #333;
  background: linear-gradient(180deg, #f1f5ff 0%, #ffeef8 100%);
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed; // Added to prevent scrolling
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px; /* Reduce padding */
  background: #f7f9ff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  flex: 0.1; /* Allocate space for navbar */
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 2rem;
  color: #7f91f7;
  font-weight: bold;
  background: linear-gradient(90deg, #5a6ea1, #7f91f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 5px 10px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 1s ease-in-out;
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const LogoText = styled.span`
  font-size: 2rem;
  color: #7f91f7;
  font-weight: bold;
  background: linear-gradient(90deg, #5a6ea1, #7f91f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center; /* Center the links */
  flex-grow: 1; /* Allow the links to take up available space */
`;

const StyledNavLink = styled(NavLink)`
  color: #7f91f7;
  text-decoration: none;
  font-size: 1rem;
  font-weight: bold; /* Make the text bold */
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, color 0.3s ease;

  &.active {
    background-color: #e0e7ff; /* Light background color for active link */
    color: #5a6ea1; /* Darker color for active link */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Stronger shadow for active link */
  }

  &:hover {
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    color: #5a6ea1;
  }
`;

const ProfileButton = styled.div`
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeroSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px; /* Reduce padding */
  background: linear-gradient(90deg, #d8e9ff 0%, #ffeef8 100%);
  flex: 0.9; /* Allocate remaining space */
`;

const HeroText = styled.div`
  flex: 0.6; /* Allocate space for text */
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px; /* Reduce gap */
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #3a4d99;
  animation: ${fadeIn} 1.5s ease-in-out;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #5569af;
  animation: ${fadeIn} 2s ease-in-out;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px; /* Reduce gap */
`;

const ActionButton = styled.button`
  padding: 10px 20px; /* Increase padding */
  font-size: 1rem; /* Increase font size */
  border-radius: 15px;
  background: linear-gradient(90deg, #7f91f7, #a5b8ff);
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #a5b8ff, #7f91f7);
  }

  &:first-child {
    margin-right: 10px;
  }
`;

const HeroImage = styled.img`
  flex: 1;
  max-width: 50%;
  border-radius: 0; /* Remove border radius to fill hero section */
  height: 100%; /* Take up full height of hero section */
  object-fit: cover; /* Ensure image covers entire space */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

export default DoctorHomePage;