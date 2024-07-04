from flask import Flask, render_template, request, jsonify, Response
import random
import time

app = Flask(__name__)

# Sample texts for typing test
sample_texts = [
    "The mysterious old house creaked and groaned in the wind.",
    "Artificial intelligence is reshaping the world as we know it.",
    "Exploring the depths of the ocean reveals incredible biodiversity.",
    "In the bustling city, time seems to move faster than anywhere else.",
    "The aroma of freshly baked bread filled the entire neighborhood."
]

# Generator function to create a countdown
def countdown(t):
    for i in range(t, 0, -1):
        yield str(i)
        time.sleep(1)

@app.route('/')
def index():
    return render_template('index.html', text=random.choice(sample_texts))

@app.route('/check', methods=['POST'])
def check():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    user_input = data.get('text')
    original_text = data.get('original')
    time_taken = data.get('time')
    
    if not all([user_input, original_text, time_taken]):
        return jsonify({'error': 'Please enter the text'}), 400
    
    correct_chars = sum(a == b for a, b in zip(user_input, original_text))
    accuracy = (correct_chars / len(original_text)) * 100
    
    words = len(original_text.split())
    time_taken = max(float(time_taken), 0.01)
    
    raw_wpm = (words / time_taken) * 60
    wpm = min(raw_wpm, 100)
    
    return jsonify({'accuracy': round(accuracy, 2), 'wpm': round(wpm, 2)})

@app.route('/countdown')
def countdown_stream():
    return Response(countdown(10), mimetype='text/html')

if __name__ == '__main__':
    app.run(debug=True)
