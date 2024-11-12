from flask import Flask, request, jsonify
import whisper
import os
import google.generativeai as genai
import textwrap
from googletrans import Translator
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

whisper_model = whisper.load_model("base")

translator = Translator()
# Configure Google API for summarization (ensure you've set your API key)
GOOGLE_API_KEY = "AIzaSyAv97r8UIiqrNZjPVUUpMN7kDxqC1nEx7A"
genai.configure(api_key=GOOGLE_API_KEY)

# Summarization function using Gemini
def summarize_text(input_text):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(f"Summarize the following text: {input_text}")
    return response.text

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

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, port=5000)