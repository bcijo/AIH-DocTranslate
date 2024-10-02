import { useState, useEffect } from 'react';

function useRecorder() {
  const [recorder, setRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (recorder === null) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            const newRecorder = new MediaRecorder(stream);
            setRecorder(newRecorder);
          });
      }
    }
  }, [recorder]);

  const startRecording = () => {
    if (recorder && recorder.state === 'inactive') {
      recorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (recorder) {
      recorder.ondataavailable = (e) => {
        const url = URL.createObjectURL(e.data);
        setAudioURL(url);
      };
    }
  }, [recorder]);

  return [audioURL, isRecording, startRecording, stopRecording];
}

export default useRecorder;