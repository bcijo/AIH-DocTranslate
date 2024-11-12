from flask import Flask, request, jsonify
import whisper
import os

app = Flask(__name__)

# Load the Whisper model
model = whisper.load_model("base")

@app.route('/')
def home():
    return "Welcome to the Language Detection API! Use the /api/language-detection endpoint to send audio files."

@app.route('/api/language-detection', methods=['POST'])
def detect_language():
    # Check if the post request has the file part
    breakpoint()
    print("entered breakpoint here")
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No audio file selected'}), 400

    # Save the audio file to a temporary location
    temp_file_path = os.path.join('temp', file.filename)
    file.save(temp_file_path)

    # Load audio and pad/trim it to fit 30 seconds
    audio = whisper.load_audio(temp_file_path)
    audio = whisper.pad_or_trim(audio)

    # Make log-Mel spectrogram and move to the same device as the model
    mel = whisper.log_mel_spectrogram(audio).to(model.device)

    # Detect the spoken language
    _, probs = model.detect_language(mel)
    detected_language = max(probs, key=probs.get)

    # Clean up the temporary file
    os.remove(temp_file_path)

    return jsonify({'detected_language': detected_language})

if __name__ == '__main__':
    # Create a temporary directory for uploads
    if not os.path.exists('temp'):
        os.makedirs('temp')

    app.run(debug=True, port=5000)