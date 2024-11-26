from flask import Flask, request, jsonify, send_file
import whisper
import os
import google.generativeai as genai
import textwrap
from googletrans import Translator
from flask_cors import CORS
from gtts import gTTS
import pygame
import uuid
import threading
import time
from twilio.rest import Client
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
whisper_model = whisper.load_model("base")

translator = Translator()
# Configure Google API for summarization (ensure you've set your API key)
GOOGLE_API_KEY = "AIzaSyAv97r8UIiqrNZjPVUUpMN7kDxqC1nEx7A"
genai.configure(api_key=GOOGLE_API_KEY)

# Your Twilio credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')  # Replace with your Twilio account SID
auth_token =   os.getenv('TWILIO_AUTH_TOKEN')  # Replace with your Twilio auth token
client = Client(account_sid, auth_token)


# Initialize pygame mixer for controlling audio playback globally
pygame.mixer.init()

# Summarization function using Gemini
def summarize_text(input_text):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(f"Summarize the following text: {input_text}")
    return response.text

# Function to speak text using gTTS and save as MP3
def speak_with_gtts(text, lang='en'):
    try:
        # Create a unique filename for each audio file to avoid overwriting
        audio_filename = f"output_{uuid.uuid4().hex}.mp3"

        # Convert the text to speech and save it as an MP3 file
        tts = gTTS(text=text, lang=lang)
        tts.save(audio_filename)

        return audio_filename

    except Exception as e:
        print(f"Error: {str(e)}")
        return None

# Function to play audio in a thread
def play_audio(filename):
    try:
        pygame.mixer.music.load(filename)
        pygame.mixer.music.play()

        # Wait while music is playing
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)

        # Clean up the file after playing
        os.remove(filename)
    except Exception as e:
        print(f"Audio playback error: {str(e)}")

@app.route('/')
def home():
    """
    Home route to display a welcome message and usage information.
    """
    return "Welcome to the Language Detection and Summarization API! Use the /api/language-detection and /api/summarize endpoints."

@app.route('/api/language-detection', methods=['POST'])
def detect_language():
    """
    Endpoint to detect the language of an audio file uploaded via POST request.
    """
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No audio file selected'}), 400

    temp_dir = 'temp'
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)

    temp_file_path = os.path.join(temp_dir, file.filename)
    file.save(temp_file_path)

    try:
        # Load audio and pad/trim it to fit 30 seconds
        audio = whisper.load_audio(temp_file_path)
        audio = whisper.pad_or_trim(audio)

        # Create log-Mel spectrogram and move to the same device as the model
        mel = whisper.log_mel_spectrogram(audio).to(whisper_model.device)

        # Detect the spoken language
        _, probs = whisper_model.detect_language(mel)
        detected_language = max(probs, key=probs.get)

        return jsonify({'detected_language': detected_language})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """
    Endpoint to translate text using Google Translate.
    """
    if not request.json or 'text' not in request.json or 'target_lang' not in request.json:
        return jsonify({'error': 'Invalid request'}), 400

    text = request.json['text']
    target_lang = request.json['target_lang']

    try:
        translated = translator.translate(text, dest=target_lang)
        return jsonify({'translated_text': translated.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """
    Endpoint to summarize text using the Gemini model.
    """
    if not request.json or 'text' not in request.json:
        return jsonify({'error': 'No text provided for summarization'}), 400

    input_text = request.json['text']

    try:
        summary = summarize_text(input_text)
        return jsonify({'summary': summary})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/speak', methods=['POST'])
def speak():
    if not request.json or 'text' not in request.json or 'lang' not in request.json:
        return jsonify({'error': 'No text or language provided for speech'}), 400

    text = request.json['text']
    lang = request.json['lang']  # Language code from the frontend

    try:
        # Use gTTS to convert text to speech and save it
        audio_filename = speak_with_gtts(text, lang)

        if audio_filename:
            return send_file(audio_filename, mimetype='audio/mp3', as_attachment=True)

        return jsonify({'error': 'Failed to generate speech'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stop-speech', methods=['POST'])
def stop_speech():
    """
    Endpoint to stop the speech if it is currently playing.
    """
    try:
        # Stop the speech playback if it is playing
        pygame.mixer.music.stop()
        return jsonify({'message': 'Speech stopped successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/make-call', methods=['POST'])
def make_call():
    data = request.json
    phone = data.get('phoneNumber')
    if not phone:
        return jsonify({'error': 'No phone number provided'}), 400
    try:
        call = client.calls.create(
            url='http://demo.twilio.com/docs/voice.xml',
            to=phone,
            from_='+13854744792'
        )
        return jsonify({'message': 'Call initiated', 'callSid': call.sid})
    except Exception as e:
        print(f'Error making call: {e}')
        return jsonify({'error': 'Failed to make call'}), 500


if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, port=5000)


