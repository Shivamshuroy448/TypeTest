let startTime;
let timerInterval;
let typingStarted = false;
let originalText = "";
let currentIndex = 0;
const userInput = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-btn');
const reloadBtn = document.getElementById('reload-btn');
const result = document.getElementById('result');
const timerDisplay = document.getElementById('timer-box');
const textContainer = document.getElementById('text-container');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const practiceBtn = document.getElementById('practice-btn');
const progressBar = document.getElementById('progress');

function startTimer() {
    startTime = new Date().getTime();
    timerInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startTime;
        const seconds = Math.floor(elapsedTime / 1000);
        const milliseconds = elapsedTime % 1000;
        timerDisplay.textContent = `Time: ${seconds}.${milliseconds.toString().padStart(3, '0')} secs`;
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTest() {
    userInput.value = '';
    result.textContent = '';
    timerDisplay.textContent = 'Time: 0s';
    stopTimer();
    startTime = null;
    typingStarted = false;
    currentIndex = 0;
    userInput.disabled = false;
    submitBtn.disabled = false;
    updateTextDisplay();
    progressBar.style.width = '0%';
}

function submitTest() {
    if (!startTime) return;
    stopTimer();
    userInput.disabled = true;
    submitBtn.disabled = true;
    const endTime = new Date();
    const timeTaken = Math.max((endTime - startTime) / 1000, 0.01);
    fetch('/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: userInput.value,
            original: originalText,
            time: timeTaken
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            result.textContent = `Error: ${data.error}`;
        } else {
            result.textContent = `Accuracy: ${data.accuracy}%, WPM: ${data.wpm}`;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        result.textContent = 'An error occurred. Please try again.';
    });
}

function updateTextDisplay() {
    let displayText = '';
    for (let i = 0; i < originalText.length; i++) {
        if (i < currentIndex) {
            displayText += `<span class="highlight">${originalText[i]}</span>`;
        } else if (i === currentIndex) {
            displayText += `<span class="highlight" style="text-decoration: underline;">${originalText[i]}</span>`;
        } else {
            displayText += originalText[i];
        }
    }
    textContainer.innerHTML = displayText;
}

function loadNewText() {
    fetch('/get_text')
        .then(response => response.text())
        .then(text => {
            originalText = text;
            resetTest();
        });
}

userInput.addEventListener('input', () => {
    if (!typingStarted) {
        typingStarted = true;
        startTimer();
    }
    const currentText = userInput.value;
    currentIndex = currentText.length;
    updateTextDisplay();
    const progress = (currentIndex / originalText.length) * 100;
    progressBar.style.width = `${progress}%`;
});

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitTest();
    }
});

submitBtn.addEventListener('click', submitTest);
reloadBtn.addEventListener('click', loadNewText);

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

practiceBtn.addEventListener('click', () => {
    resetTest();
});

// Load initial text
loadNewText();
