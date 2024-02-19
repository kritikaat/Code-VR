// index.js
let questions = [];
let currentQuestion = 0;
let score = 0;
let quizStartTime;
const totalTime = 60;
let elapsedTime = 0;
let timerInterval;

const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const resultElement = document.getElementById('result');
const startButton = document.getElementById('start-btn');
const submitButton = document.getElementById('submit-btn');
const nextButton = document.getElementById('next-btn');
const previousButton = document.getElementById('previous-btn');
const timerDisplay = document.getElementById('time');

startButton.addEventListener('click', startQuiz);
submitButton.addEventListener('click', submitAnswer);
nextButton.addEventListener('click', nextQuestion);
previousButton.addEventListener('click', previousQuestion);

function startQuiz() {
    fetch('cquestions.json') // Update the file path if needed
        .then(response => response.json())
        .then(data => {
            questions = data;
            startButton.style.display = 'none';
            document.getElementById('question-container').style.display = 'block';
            nextButton.style.display = 'block';
            previousButton.style.display = 'block';
            quizStartTime = new Date();
            timerInterval = setInterval(updateTimer, 1000);
            loadQuestion();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function updateTimer() {
    const currentTime = new Date();
    const timeDiff = (currentTime - quizStartTime) / 1000;
    elapsedTime = Math.floor(timeDiff);

    const remainingSeconds = totalTime - elapsedTime;

    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = remainingSeconds % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    timerDisplay.textContent = `${minutes}:${seconds}`;

    if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        finishQuiz();
    }
}

function loadQuestion() {
    const currentQuizData = questions[currentQuestion];
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    
    questionElement.innerHTML = `<p>${currentQuizData.question}</p><code>${currentQuizData.code}</code>`;
    optionsElement.innerHTML = "";

    currentQuizData.options.forEach((option) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectOption(option));
        optionsElement.appendChild(button);
    });

    loadPreviousOption();
}

function selectOption(selectedOptionText) {
    const currentQuizData = questions[currentQuestion];
    const optionButtons = document.querySelectorAll('.option-btn');

    optionButtons.forEach(button => {
        button.classList.remove('selected');
    });

    optionButtons.forEach((button, index) => {
        if (button.innerText === selectedOptionText) {
            button.classList.add('selected');
            
            // Check if the selected option is correct
            const isCorrect = selectedOptionText === currentQuizData.correctAnswer;

            // If the selected answer is correct and hasn't been selected previously for this question, increment the score
            if (isCorrect && !button.classList.contains('correct')) {
                score++;
                button.classList.add('correct');
            } else {
                // If the selected answer is incorrect, decrement the score (if greater than 0)
                if (score > 0) {
                    score--;
                }
            }

            localStorage.setItem(`selectedOption_${currentQuestion}`, selectedOptionText);
        }
    });
}

function submitAnswer() {
    const selectedOption = document.querySelector('.option-btn.selected');
    if (!selectedOption) return;

    const currentQuizData = questions[currentQuestion];
    const selectedOptionText = selectedOption.innerText;

    // Check if the selected option is correct
    const isCorrect = selectedOptionText === currentQuizData.correctAnswer;

    if (isCorrect) {
        score++;
    }

    localStorage.setItem(`selectedOption_${currentQuestion}`, selectedOptionText);

    selectedOption.classList.remove('selected');
    nextQuestion();
}

function loadPreviousOption() {
    const previousOptionText = localStorage.getItem(`selectedOption_${currentQuestion}`);
    if (previousOptionText !== null) {
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            if (button.innerText === previousOptionText) {
                button.classList.add('selected');
            }
        });
    }
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
        quizStartTime = new Date(new Date() - (elapsedTime * 1000));
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
        quizStartTime = new Date(new Date() - (elapsedTime * 1000));
    }
}

function finishQuiz() {
    clearInterval(timerInterval);
    document.getElementById('question-container').style.display = 'none';
    nextButton.style.display = 'none';
    previousButton.style.display = 'none';
    submitButton.style.display = 'none';
    resultElement.style.display = 'block';
    resultElement.innerText = `You scored ${score}/${questions.length}`;
}
