import { useState, useEffect } from 'react';

const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); // State to store the audio URL

  useEffect(() => {
    // Check for the browser's mediaDevices support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("MediaDevices supported.");
    } else {
      console.warn("MediaDevices not supported.");
    }

    return () => {
      // Clean up the audio URL when the component is unmounted or updated
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          const audioBlob = event.data;
          const url = URL.createObjectURL(audioBlob); // Create a URL for the recorded audio
          setAudioUrl(url); // Set the audio URL state
          console.log("Recording finished:", url);
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      })
      .catch(error => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioUrl // Return the audio URL
  };
};

export default useRecorder;