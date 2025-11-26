const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const cors = require('cors');  // Add CORS for cross-origin requests

const app = express();
const port = 5000;

// Your Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(cors());  // Enable CORS

// Endpoint to make a call
app.post('/make-call', (req, res) => {
  const phone = '+919148369005';  // Predefined set number to call
  
  client.calls.create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: phone,
    from: process.env.TWILIO_PHONE_NUMBER,
  })
  .then(call => {
    console.log(call.sid);
    res.json({ message: 'Call initiated', callSid: call.sid });
  })
  .catch(error => {
    console.error('Error making call:', error);
    res.status(500).json({ error: 'Failed to make call' });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
