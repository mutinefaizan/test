const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    "Life is what happens when you're busy making other plans.",
    "In three words I can sum up everything I've learned about life: it goes on.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It is during our darkest moments that we must focus to see the light.",
    "Believe you can and you're halfway there.",
    "Everything you've ever wanted is on the other side of fear.",
    "The only way to do great work is to love what you do."
];

let timer;
let seconds = 0;
let errors = 0;
let isTyping = false;
let totalCharacters = 0;
let correctCharacters = 0;
let countdownTimer;
let currentSentence = '';

function updateProgressBar(typedLength) {
    const progress = (typedLength / currentSentence.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function calculateAccuracy() {
    return totalCharacters === 0 ? 100 : Math.round((correctCharacters / totalCharacters) * 100);
}

function updateStats(typedText) {
    const words = typedText.trim().split(' ').length;
    const chars = typedText.length;
    const wpm = Math.round((words / seconds) * 60) || 0;
    const cpm = Math.round((chars / seconds) * 60) || 0;
    const accuracy = calculateAccuracy();

    document.getElementById('wpm').innerText = wpm;
    document.getElementById('cpm').innerText = cpm;
    document.getElementById('errors').innerText = errors;
    document.getElementById('accuracy').innerText = `${accuracy}%`;

    return { wpm, cpm, accuracy };
}

function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    let count = 3;
    countdownElement.style.display = 'block';
    
    return new Promise((resolve) => {
        countdownTimer = setInterval(() => {
            countdownElement.innerText = count;
            if (count === 0) {
                clearInterval(countdownTimer);
                countdownElement.style.display = 'none';
                resolve();
            }
            count--;
        }, 1000);
    });
}

async function startTest() {
    const sentenceElement = document.getElementById('sentence');
    const inputElement = document.getElementById('input');
    const progressBar = document.getElementById('progress-bar');

    // Reset everything
    clearInterval(timer);
    inputElement.value = '';
    errors = 0;
    seconds = 0;
    totalCharacters = 0;
    correctCharacters = 0;
    progressBar.style.width = '0%';
    
    // Get random sentence
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    sentenceElement.innerText = currentSentence;
    
    // Disable input during countdown
    inputElement.disabled = true;
    
    // Start countdown
    await startCountdown();
    
    // Enable input and focus
    inputElement.disabled = false;
    inputElement.focus();
    isTyping = true;

    // Start timer
    timer = setInterval(() => {
        if (isTyping) {
            seconds++;
            updateStats(inputElement.value);
        }
    }, 1000);
}

function finishTest() {
    if (!isTyping) return;
    
    clearInterval(timer);
    isTyping = false;
    const inputElement = document.getElementById('input');
    const stats = updateStats(inputElement.value);
    
    // Save results to localStorage
    localStorage.setItem('wpm', stats.wpm);
    localStorage.setItem('cpm', stats.cpm);
    localStorage.setItem('errors', errors);
    localStorage.setItem('accuracy', stats.accuracy);
    localStorage.setItem('time', seconds);
    
    window.location.href = 'result.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('input');
    const sentenceElement = document.getElementById('sentence');
    const resetButton = document.getElementById('reset');
    const finishButton = document.getElementById('finish');

    inputElement.addEventListener('input', () => {
        if (!isTyping) return;

        const typedText = inputElement.value;
        totalCharacters = typedText.length;
        correctCharacters = 0;

        // Check each character
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === currentSentence[i]) {
                correctCharacters++;
            }
        }

        // Update errors
        errors = totalCharacters - correctCharacters;
        
        // Update progress bar
        updateProgressBar(typedText.length);

        // Check if sentence is completed
        if (typedText === currentSentence) {
            finishTest();
        }

        // Update typing text styling
        if (errors > 0) {
            sentenceElement.classList.add('error');
            sentenceElement.classList.remove('correct');
        } else {
            sentenceElement.classList.add('correct');
            sentenceElement.classList.remove('error');
        }
    });

    resetButton.addEventListener('click', startTest);
    finishButton.addEventListener('click', finishTest);

    // Start the test when the page loads
    startTest();
});
