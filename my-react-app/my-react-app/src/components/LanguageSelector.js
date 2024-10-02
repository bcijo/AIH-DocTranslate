import React, { useState } from 'react';
import styled from 'styled-components';

function LanguageSelector({ languages }) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  return (
    <SelectorContainer>
      <Label>Available Languages</Label>
      <LanguageBox>
        {languages.map((lang, index) => (
          <LanguageButton
            key={index}
            onClick={() => setSelectedLanguage(lang)}
            isSelected={selectedLanguage === lang}
          >
            {lang}
          </LanguageButton>
        ))}
      </LanguageBox>
    </SelectorContainer>
  );
}

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const Label = styled.p`
  margin: 0;
  font-weight: bold;
  color: gray;
`;

const LanguageBox = styled.div`
  display: flex;
  gap: 10px;
`;

const LanguageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid gray;
  border-radius: 20px;
  background-color: ${(props) => (props.isSelected ? 'orange' : 'white')};
  color: ${(props) => (props.isSelected ? 'white' : 'black')};
  cursor: pointer;
`;

export default LanguageSelector;