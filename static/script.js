let startTime;
let timerInterval;
let typingStarted = false;
const originalText = document.getElementById('text-container').innerText;
const userInput = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-btn');
const reloadBtn = document.getElementById('reload-btn');
const result = document.getElementById('result');
const timerDisplay = document.getElementById('timer-box');

function startTimer() {
    startTime = new Date().getTime();
    timerInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startTime; // in milliseconds

        // Calculate seconds and milliseconds
        const seconds = Math.floor(elapsedTime / 1000);
        const milliseconds = elapsedTime % 1000;

        // Display the timer with seconds and milliseconds
        timerDisplay.textContent = `Time: ${seconds}.${milliseconds.toString().padStart(3, '0')} secs`;

    }, 100); // Update every 100 milliseconds for smoother display
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
    userInput.disabled = false;
    submitBtn.disabled = false;
}

function submitTest() {
    if (!startTime) return;
    stopTimer();
    userInput.disabled = true;
    submitBtn.disabled = true;
    const endTime = new Date();
    const timeTaken = Math.max((endTime - startTime) / 1000, 0.01); // Convert to seconds, minimum 0.01
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

userInput.addEventListener('input', () => {
    if (!typingStarted) {
        typingStarted = true;
        startTimer();
    }
});

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent default behavior (new line)
        submitTest();
    }
});

submitBtn.addEventListener('click', submitTest);
reloadBtn.addEventListener('click', () => {
    resetTest();
    location.reload(); // This will reload the page, fetching a new random text
});

// Reset the test when the page loads
resetTest();
