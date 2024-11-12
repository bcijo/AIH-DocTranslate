from flask import Flask, request, jsonify
import pyttsx3
from googletrans import Translator
from transformers import pipeline  # For summarization

app = Flask(__name__)

# Initialize text-to-speech engine
engine = pyttsx3.init()

# Map languages to pyttsx3 voice IDs
language_map = {
    'telugu': 'te',  # Telugu voice tag
    'kannada': 'kn',  # Kannada voice tag
    'tamil': 'ta',  # Tamil voice tag
    'malayalam': 'ml',  # Malayalam voice tag
    'hindi': 'hi'  # Hindi voice tag
}

# Summarization model
summarizer = pipeline("summarization")

def speak_text(text, language):
    voices = engine.getProperty('voices')
    selected_voice = None

    # Find the appropriate voice for the language
    for voice in voices:
        if language_map.get(language, '') in voice.languages:
            selected_voice = voice.id
            break

    if selected_voice:
        engine.setProperty('voice', selected_voice)
    else:
        engine.setProperty('voice', voices[0].id)  # Fallback to the first voice

    engine.setProperty('rate', 150)  # Set speech rate
    engine.say(text)
    engine.runAndWait()

def translate_text(text, target_lang):
    translator = Translator()
    translation = translator.translate(text, dest=target_lang)
    return translation.text

def summarize_text(text):
    summary = summarizer(text, max_length=150, min_length=50, do_sample=False)
    return summary[0]['summary_text']

@app.route('/api/speak', methods=['POST'])
def speak():
    data = request.json
    text = data['text']
    language = data['language']
    try:
        speak_text(text, language)
        return jsonify({"message": "Speech generated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.json
    text = data['text']
    target_lang = data['target_lang']
    try:
        translated_text = translate_text(text, target_lang)
        return jsonify({"translated_text": translated_text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/summarize', methods=['POST'])
def summarize():
    data = request.json
    text = data['text']
    try:
        summary = summarize_text(text)
        return jsonify({"summary": summary}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
