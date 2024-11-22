// import React from 'react';
// import styled, { createGlobalStyle } from 'styled-components';

// function Availability() {
//   const handleCallNow = () => {
//     alert('Call Initiated');
//   };

//   return (
//     <>
//       <GlobalStyle />
//       <Container>
//         <CallButton onClick={handleCallNow}>Call Now</CallButton>
//       </Container>
//     </>
//   );
// }

// const GlobalStyle = createGlobalStyle`
//   body {
//     margin: 0;
//     padding: 0;
//     font-family: 'Arial', sans-serif;
//     background: linear-gradient(135deg, #d8e9ff 0%, #ffeef8 100%);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     height: 100vh;
//   }
// `;

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   height: 100vh;
// `;

// const CallButton = styled.button`
//   padding: 15px 30px;
//   background-color: #3a4d99;
//   color: white;
//   border: none;
//   border-radius: 8px;
//   font-size: 1.2rem;
//   cursor: pointer;
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

//   &:hover {
//     background-color: #5569af;
//   }
// `;

// export default Availability;
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';

function Availability() {
  const handleCallNow = async () => {
    try {
      const response = await axios.post('http://localhost:5000/make-call');
      alert(response.data.message); // Show the alert when the call is successfully initiated
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to initiate call');
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <CallButton onClick={handleCallNow}>Call Now</CallButton>
      </Container>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #d8e9ff 0%, #ffeef8 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const CallButton = styled.button`
  padding: 15px 30px;
  background-color: #3a4d99;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #5569af;
  }
`;

export default Availability;
