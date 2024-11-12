// src/components/UserProfile.js
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const UserProfile = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ProfileContainer ref={dropdownRef}>
      <ProfileButton onClick={() => setIsOpen(!isOpen)}>
        {user?.photoURL ? (
          <ProfileImage src={user.photoURL} alt="Profile" />
        ) : (
          <ProfileInitial>{user?.email?.[0].toUpperCase() || 'U'}</ProfileInitial>
        )}
      </ProfileButton>

      {isOpen && (
        <DropdownMenu>
          <UserInfo>
            {user?.photoURL && <ProfileImage src={user.photoURL} alt="Profile" />}
            <UserDetails>
              <UserName>{user?.displayName || 'User'}</UserName>
              <UserEmail>{user?.email}</UserEmail>
            </UserDetails>
          </UserInfo>
          <Divider />
          <MenuItem onClick={handleSignOut}>
            <MenuIcon>↪</MenuIcon>
            Sign Out
          </MenuItem>
        </DropdownMenu>
      )}
    </ProfileContainer>
  );
};

// Styled Components
const ProfileContainer = styled.div`
  position: relative;
  z-index: 1000;
`;

const ProfileButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProfileInitial = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const UserInfo = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.span`
  font-weight: 500;
  color: #333;
`;

const UserEmail = styled.span`
  font-size: 12px;
  color: #666;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 0;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  text-align: left;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const MenuIcon = styled.span`
  font-size: 18px;
`;

export default UserProfile;