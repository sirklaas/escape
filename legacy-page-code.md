# Legacy Escape Room Game Page Code

Reference code from the original WordPress/static HTML game pages.

---

## HTML Structure

```html
<div id="game-container">
    <div id="team-name-display"></div>
    <div id="timer-container">
        <div id="timer">Timer: 0 seconds</div>
    </div>
    <div id="welcome-text"></div>
    <input type="text" id="word-input" placeholder="Vul hier het juiste antwoord in">
    <div id="submit-attempts-container">
        <div id="attempts">Poging: 0</div>
        <button id="submit-btn">Check</button>
    </div>
    <button id="hint-btn">Jullie kunnen een hint kopen</button>
    <div id="hint-popup">
        <span class="close">&times;</span>
        <p id="hint-text"></p>
    </div>
    <div id="countdown-container">
        <svg width="50" height="50" viewBox="0 0 100 100">
            <circle class="circle-bg" cx="50" cy="50" r="45" />
            <circle id="countdown-circle" cx="50" cy="50" r="45" transform="rotate(-90 50 50)" />
        </svg>
        
        <div id="time-up-message" style="display: none;">
            <p>Jullie tijd zit er helaas voor deze chalenge op. <br>Op naar de volgende</p>
            <button id="next-page-btn" onclick="goToNextPage()" style="display: none;">gauw een andere dan!</button>
        </div>
    </div>

    <div id="wrong-alert">
        <span class="close-alert">&times;</span>
        <p>Helaas! Dat is niet juist. Probeer het opnieuw.</p>
    </div>

    <div id="correct-alert">
        <h1>Geweldig gedaan</h1>
        <p id="correct-message"></p>
        <button onclick="goToNextPage()">OK</button>
        <div class="team-info">
            <p id="total-score-display"></p>
        </div>
    </div>
</div>
```

---

## CSS

```css
body {
    font-family: 'Barlow Semi Condensed', sans-serif;
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    font-size: 1.6rem;
}

#timer-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

#timer {
    background-color: #DEE2E6;
    border-radius: 20px;
    padding: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
}

#welcome-text {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
}

#word-input {
    padding: 10px;
    width: 100%;
    max-width: 300px;
    height: 40px;
    border-radius: 20px;
    border: 2px solid #ccc;
    margin: 0 auto;
    display: block;
}

#submit-attempts-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding: 25px;
}

#submit-btn {
    padding: 5px 15px;
    cursor: pointer;
    background-color: #D62828;
    color: white;
    border: none;
    border-radius: 15px;
    height: 30px;
    box-shadow: 0 0 10px rgba(214, 40, 40, 0.5);
    transition: all 0.3s ease;
    margin-right: 1px;
}

#submit-btn:hover {
    box-shadow: 0 0 25px rgba(214, 40, 40, 0.7);
}

#attempts {
    margin: 0;
    margin-left: 5px;
}

#hint-btn {
    padding: 10px 20px;
    margin-top: 20px;
    cursor: pointer;
    opacity: 0;
    transform: translateX(100%);
    transition: all 2s ease;
    display: block;
    margin-left: auto;
    margin-right: auto;
}

#hint-btn.show {
    opacity: 1;
    transform: translateX(0);
}

#hint-popup {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(to bottom, #FFB703, #FFE0A6);
    padding: 20px;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    border-radius: 15px;
    width: 300px;
    height: 300px;
    opacity: 0;
    transition: opacity 2s ease;
}

#hint-popup.show {
    opacity: 1;
}

#hint-popup .close {
    position: absolute;
    top: 10px;
    right: 15px;
    cursor: pointer;
    font-size: 3em;
    line-height: 1;
}

#wrong-alert, #correct-alert {
    display: none;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 300px;
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    z-index: 1000;
    transition: all 0.5s ease;
}

#wrong-alert {
    background-color: #D62828;
    color: white;
    bottom: -100px;
}

#wrong-alert.show {
    bottom: 20px;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -40%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translate(-50%, -50%); }
    to { opacity: 0; transform: translate(-50%, -60%); }
}

#correct-alert {
    display: none;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 300px;
    padding: 20px;
    border-radius: 20px;
    text-align: center;
    z-index: 1000;
    background: linear-gradient(to bottom, #F7B721, #FCFFD2);
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    opacity: 0;
}

#correct-alert.show {
    display: block;
    animation: fadeIn 1.5s ease-in forwards;
}

#correct-alert.hide {
    animation: fadeOut 1.5s ease-in forwards;
}

#correct-alert h1 {
    color: #003566;
    margin-top: 0;
}

#correct-alert button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #003566;
    color: white;
    border: 3px solid white;
    font-size: 2rem;
    cursor: pointer;
    margin-top: 15px;
}

#correct-alert .team-info {
    background-color: #D62828;
    color: white;
    padding: 10px;
    border-radius: 10px;
    margin-top: 15px;
    border: 3px solid white;
}

#countdown-container {
    position: fixed;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 50px;
}

svg {
    width: 100%;
    height: 100%;
}

.circle-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.3);
    stroke-width: 10px;
}

#countdown-circle {
    fill: none;
    stroke: #D62828;
    stroke-width: 10px;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s linear;
}

@keyframes moveUp {
    0% {
        transform: translate(-50%, -50%);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -100%);
        opacity: .7;
    }
}

#time-up-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 450px;
    background-color: red;
    color: white;
    padding: 20px;
    border: 3px solid white;
    border-radius: 15px;
    text-align: center;
    font-size: 2rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    animation: moveUp 4.5s forwards;
}

#time-up-message p {
    margin: 0;
    padding: 0;
}

#team-name-display {
    text-align: center;
    font-weight: light;
    margin-bottom: 10px;
}
```

---

## JavaScript

```js
// Set the current page number here
const currentPage = 1; // Change this for each page (1 to 18)

const gameSettings = {
    hintButtonAppearTime: 120, // in seconds
    timerIncrementInterval: 5, // in seconds
    incorrectGuessPenalty: 25, // in seconds
    sounds: {
        ping: 'https://www.crazy.local/button/sounds/Chime2.wav',
        buzz: 'https://www.crazy.local/button/sounds/Expired.wav',
        doorbell: 'https://www.crazy.local/fun/sounds/doorbell.wav' 
    }
};

const totalPages = 18;
const challengeDuration = 600; // 10 minutes in seconds

let timer = 0;
let attempts = 0;
let currentHint = 0;
let pageData = null;
let challengeTimer = 0;
let teamName = '';
let timerInterval;
let pb; // Will hold the PocketBase instance
let isScoreSaved = false;

// DOM element variables
let timerElement, attemptsElement, wordInput, submitBtn, hintBtn, hintPopup, hintTextElement, closePopup, wrongAlert, correctAlert, correctMessage, gameContainer, welcomeText, countdownCircle, timeUpMessage, teamNameDisplay;

function setTeamName(name) {
    localStorage.setItem('escaperoomTeamName', name);
}

function getTeamName() {
    return localStorage.getItem('escaperoomTeamName') || 'Unknown Team';
}

async function initializeTeamName() {
    let teamName = getTeamName();
    
    if (teamName === 'Unknown Team') {
        try {
            const records = await pb.collection('escape_game_data').getFullList({
                sort: '-created',
                limit: 1
            });
            if (records.length > 0) {
                teamName = records[0].team_name;
                setTeamName(teamName);
            } else {
                console.warn("No team found in PocketBase. Using 'Unknown Team'.");
            }
        } catch (error) {
            console.error("Error getting team name from PocketBase:", error);
        }
    } else {
        try {
            await pb.collection('escape_game_data').getFirstListItem(`team_name="${teamName}"`);
        } catch (error) {
            if (error.status === 404) {
                console.warn("Team found in localStorage but not in PocketBase. Updating PocketBase...");
                try {
                    await pb.collection('escape_game_data').create({ team_name: teamName });
                } catch (createError) {
                    console.error("Error creating team in PocketBase:", createError);
                }
            } else {
                console.error("Error checking team in PocketBase:", error);
            }
        }
    }

    return teamName;
}

function loadPocketBaseScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/pocketbase@0.15.2/dist/pocketbase.umd.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initializePocketBase() {
    try {
        await loadPocketBaseScript();
        console.log("PocketBase script loaded successfully");
        
        const baseUrl = 'https://pinkmilk.pockethost.io';
        pb = new PocketBase(baseUrl);
        
        const authData = await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");
        console.log("PocketBase initialized and connected successfully");
        return true;
    } catch (error) {
        console.error("Failed to initialize PocketBase:", error);
        return false;
    }
}

async function loadGameData() {
    try {
        const response = await fetch('/fun/escapedata.json');
        const data = await response.json();
        console.log('Loaded JSON data:', data);
        pageData = data.pages.find(page => page.pageNumber === currentPage);
        console.log('Page data:', pageData);
        if (pageData) {
            await setupPage();
        } else {
            console.error('Page data not found');
        }
    } catch (error) {
        console.error('Error loading game data:', error);
        console.error('Error details:', error.message);
    }
}

async function setupPage() {
    resetScoreSavedFlag();
    teamName = await initializeTeamName();

    if (teamNameDisplay) {
        teamNameDisplay.textContent = `Team: ${teamName}`;
    } else {
        console.error('Team name display element not found');
    }

    welcomeText.innerHTML = `
        <strong>${pageData.kop}</strong><br>
        ${pageData.bodyTxt}
    `;
    gameSettings.correctWord = pageData.correctAnswer;
    gameSettings.hints = pageData.hints.map((hint, index) => ({ text: hint, cost: (index + 1) * 100 }));

    const dashArray = 2 * Math.PI * 45;

    if (currentPage % 2 !== 0) {
        // Odd-numbered page (start of a new challenge)
        challengeTimer = 0;
        countdownCircle.style.strokeDasharray = dashArray;
        countdownCircle.style.strokeDashoffset = 0;
        timeUpMessage.style.display = 'none';
    } else {
        // Even-numbered page (continuation of the challenge)
        const gameData = await getGameData();
        challengeTimer = gameData.challenge_timer || 0;
        const progress = challengeTimer / challengeDuration;
        const dashOffset = dashArray * (1 - progress);
        countdownCircle.style.strokeDasharray = dashArray;
        countdownCircle.style.strokeDashoffset = dashOffset;
        if (challengeTimer >= challengeDuration) {
            timeUpMessage.style.display = 'block';
            hintBtn.style.display = 'none';
            submitBtn.disabled = true;
            wordInput.disabled = true;
        }
    }

    startTimer();
}

async function getGameData() {
    const teamName = getTeamName();
    try {
        const record = await pb.collection('escape_game_data').getFirstListItem(`team_name="${teamName}"`);
        return record;
    } catch (error) {
        console.error('Error getting game data:', error);
        return {};
    }
}

async function updateGameData(data) {
    const teamName = getTeamName();
    try {
        const record = await pb.collection('escape_game_data').getFirstListItem(`team_name="${teamName}"`);
        await pb.collection('escape_game_data').update(record.id, data);
    } catch (error) {
        console.error('Error updating game data:', error);
    }
}

function startTimer() {
    timerInterval = setInterval(updateTimer, gameSettings.timerIncrementInterval * 1000);
}

async function updateTimer() {
    timer += gameSettings.timerIncrementInterval;
    challengeTimer += gameSettings.timerIncrementInterval;
    timerElement.textContent = `Timer: ${timer} seconds`;
    
    const progress = challengeTimer / challengeDuration;
    const dashArray = 2 * Math.PI * 45;
    const dashOffset = dashArray * (1 - progress);
    countdownCircle.style.strokeDasharray = dashArray;
    countdownCircle.style.strokeDashoffset = dashOffset;

    if (challengeTimer >= challengeDuration) {
        clearInterval(timerInterval);
        timeUpMessage.style.display = 'block';
        hintBtn.style.display = 'none';
        submitBtn.disabled = true;
        wordInput.disabled = true;
        await updateGameData({ challenge_timer: 0 });
        
        playSound('doorbell');
        
        setTimeout(() => {
            window.location.href = 'https://www.crazy.local/nine/';
        }, 6000);
    } else {
        await updateGameData({ challenge_timer: challengeTimer });
    }

    if (timer % 60 === 0) {
        playSound('ping');
    }
}

function playSound(soundName) {
    const audio = new Audio(gameSettings.sounds[soundName]);
    audio.play();
}

function showWrongAlert() {
    wrongAlert.style.display = 'block';
    setTimeout(() => {
        wrongAlert.classList.add('show');
    }, 10);
    setTimeout(() => {
        wrongAlert.classList.remove('show');
        setTimeout(() => {
            wrongAlert.style.display = 'none';
        }, 500);
    }, 3000);
}

function closeWrongAlert() {
    wrongAlert.classList.remove('show');
    setTimeout(() => {
        wrongAlert.style.display = 'none';
    }, 500);
}

async function showCorrectAlert() {
    correctMessage.innerHTML = `Jullie hadden ${timer} seconden nodig voor deze opdracht.`;
    
    const totalScore = await calculateTotalScore();
    document.getElementById('total-score-display').textContent = `Totale score: ${totalScore} seconden`;

    const teamNameElement = document.getElementById('team-name-display');
    if (teamNameElement) teamNameElement.style.display = 'none';

    correctAlert.style.display = 'block';
    setTimeout(() => {
        correctAlert.classList.add('show');
    }, 10);
}

function hideCorrectAlert() {
    correctAlert.classList.remove('show');
    correctAlert.classList.add('hide');
    correctAlert.addEventListener('animationend', function() {
        correctAlert.style.display = 'none';
        correctAlert.classList.remove('hide');
    }, {once: true});
}

function goToNextPage() {
    hideCorrectAlert();
    gameContainer.style.opacity = 0;
    updateGameData({ challenge_timer: challengeTimer });
    setTimeout(() => {
        window.location.href = pageData.nextPage;
    }, 500);
}

async function saveScore(seconds) {
    const teamName = getTeamName();
    const challengeNumber = Math.ceil(currentPage / 2);
    console.log(`Attempting to save score for team ${teamName}, challenge ${challengeNumber}, time ${seconds}`);
    
    try {
        await pb.collection('escape_challenge_scores').create({
            team_name: teamName,
            challenge_number: challengeNumber,
            time: seconds
        });
        console.log('Score saved successfully');

        const gameData = await getGameData();
        const newTotalTime = (gameData.total_time || 0) + seconds;
        await updateGameData({ total_time: newTotalTime });
        console.log('Total time updated successfully');
    } catch (error) {
        console.error('Error saving score:', error);
        isScoreSaved = false;
    }
}

async function calculateTotalScore() {
    const teamName = getTeamName();
    try {
        const records = await pb.collection('escape_challenge_scores').getFullList({ filter: `team_name="${teamName}"` });
        return records.reduce((total, record) => total + record.time, 0);
    } catch (error) {
        console.error('Error calculating total score:', error);
        return 0;
    }
}

async function checkWord() {
    console.log('Checking word...');
    const userWord = wordInput.value.toLowerCase();
    if (userWord === gameSettings.correctWord.toLowerCase()) {
        clearInterval(timerInterval);
        if (!isScoreSaved) {
            isScoreSaved = true;
            await saveScore(timer);
        }
        wordInput.disabled = true;
        submitBtn.disabled = true;
        hintBtn.style.display = 'none';
        showCorrectAlert();
    } else {
        playSound('buzz');
        attempts++;
        attemptsElement.textContent = `Poging: ${attempts}`;
        timer += gameSettings.incorrectGuessPenalty;
        timerElement.textContent = `Timer: ${timer} seconds`;
        showWrongAlert();
        console.log('Wrong answer, showing alert');
    }
    wordInput.value = '';
}

function showHint() {
    if (currentHint < gameSettings.hints.length) {
        const hintCost = gameSettings.hints[currentHint].cost;
        if (timer >= hintCost) {
            timer += hintCost;
            timerElement.textContent = `Timer: ${timer} seconds`;
            hintTextElement.textContent = gameSettings.hints[currentHint].text;
            hintPopup.style.display = 'block';
            setTimeout(() => {
                hintPopup.classList.add('show');
            }, 10);
            currentHint++;
            if (currentHint < gameSettings.hints.length) {
                hintBtn.textContent = `Jullie kunnen een hint kopen (${gameSettings.hints[currentHint].cost} sec)`;
            } else {
                hintBtn.style.display = 'none';
            }
        } else {
            showWrongAlert("Nog niet genoeg tijd om een hint kopen! Je hebt minimaal 120 seconden nodig.");
        }
    } else {
        showWrongAlert('Er zijn geen hints meer beschikbaar!');
    }
}

function addEventListeners() {
    submitBtn.addEventListener('click', checkWord);
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkWord();
    });

    hintBtn.addEventListener('click', showHint);
    closePopup.addEventListener('click', () => {
        hintPopup.classList.remove('show');
        setTimeout(() => {
            hintPopup.style.display = 'none';
        }, 2000);
    });

    document.querySelector('#wrong-alert .close-alert').addEventListener('click', closeWrongAlert);
}

function initializeDOMElements() {
    timerElement = document.getElementById('timer');
    attemptsElement = document.getElementById('attempts');
    wordInput = document.getElementById('word-input');
    submitBtn = document.getElementById('submit-btn');
    hintBtn = document.getElementById('hint-btn');
    hintPopup = document.getElementById('hint-popup');
    hintTextElement = document.getElementById('hint-text');
    closePopup = document.querySelector('.close');
    wrongAlert = document.getElementById('wrong-alert');
    correctAlert = document.getElementById('correct-alert');
    correctMessage = document.getElementById('correct-message');
    gameContainer = document.getElementById('game-container');
    welcomeText = document.getElementById('welcome-text');
    countdownCircle = document.getElementById('countdown-circle');
    timeUpMessage = document.getElementById('time-up-message');
    nextPageBtn = document.getElementById('next-page-btn');
    teamNameDisplay = document.getElementById('team-name-display');

    const allElementsFound = [
        timerElement, attemptsElement, wordInput, submitBtn, hintBtn,
        hintPopup, hintTextElement, closePopup, wrongAlert, correctAlert,
        correctMessage, gameContainer, welcomeText, countdownCircle,
        timeUpMessage, nextPageBtn
    ].every(element => element !== null);

    if (!allElementsFound) {
        console.error('Some DOM elements were not found. Please check your HTML structure.');
        return false;
    }

    return true;
}

function resetScoreSavedFlag() {
    isScoreSaved = false;
}

async function initializeGame() {
    try {
        if (!initializeDOMElements()) {
            throw new Error('DOM elements not initialized properly');
        }

        const pocketBaseInitialized = await initializePocketBase();
        if (!pocketBaseInitialized) {
            console.warn("PocketBase not initialized. Some features may not work.");
        }

        await loadGameData();
        addEventListeners();

        setTimeout(() => {
            hintBtn.classList.add('show');
        }, gameSettings.hintButtonAppearTime * 1000);
    } catch (error) {
        console.error('Failed to initialize the game:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeGame);
```
