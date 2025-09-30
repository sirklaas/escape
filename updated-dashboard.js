let jsonData = null;
let currentBlock = 0;
let hasUnsavedChanges = false;
const pagesContainer = document.getElementById('pagesContainer');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const pageInfo = document.getElementById('pageInfo');
const generateJsonButton = document.getElementById('generateJsonButton');
const downloadJsonButton = document.getElementById('downloadJsonButton');
const jsonOutput = document.getElementById('jsonOutput');

// Create new buttons
const importFromFileButton = document.createElement('button');
importFromFileButton.textContent = 'Import JSON from File';
importFromFileButton.id = 'importFromFileButton';

const importFromUrlButton = document.createElement('button');
importFromUrlButton.textContent = 'Import JSON from URL';
importFromUrlButton.id = 'importFromUrlButton';

// Create save button
const saveToServerButton = document.createElement('button');
saveToServerButton.textContent = 'Save to Server';
saveToServerButton.id = 'saveToServerButton';
saveToServerButton.style.backgroundColor = '#28a745';
saveToServerButton.style.color = 'white';
saveToServerButton.style.fontWeight = 'bold';

// Create status indicator
const statusIndicator = document.createElement('div');
statusIndicator.id = 'statusIndicator';
statusIndicator.style.padding = '10px';
statusIndicator.style.marginTop = '10px';
statusIndicator.style.borderRadius = '5px';
statusIndicator.style.display = 'none';

// Insert new elements
const container = document.querySelector('.container');
container.insertBefore(saveToServerButton, generateJsonButton);
container.insertBefore(importFromUrlButton, saveToServerButton);
container.insertBefore(importFromFileButton, importFromUrlButton);
container.appendChild(statusIndicator);

function showStatus(message, type = 'info') {
    statusIndicator.textContent = message;
    statusIndicator.style.display = 'block';
    
    // Set colors based on type
    switch(type) {
        case 'success':
            statusIndicator.style.backgroundColor = '#d4edda';
            statusIndicator.style.color = '#155724';
            statusIndicator.style.border = '1px solid #c3e6cb';
            break;
        case 'error':
            statusIndicator.style.backgroundColor = '#f8d7da';
            statusIndicator.style.color = '#721c24';
            statusIndicator.style.border = '1px solid #f5c6cb';
            break;
        case 'warning':
            statusIndicator.style.backgroundColor = '#fff3cd';
            statusIndicator.style.color = '#856404';
            statusIndicator.style.border = '1px solid #ffeaa7';
            break;
        default:
            statusIndicator.style.backgroundColor = '#d1ecf1';
            statusIndicator.style.color = '#0c5460';
            statusIndicator.style.border = '1px solid #bee5eb';
    }
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            statusIndicator.style.display = 'none';
        }, 5000);
    }
}

function updateUnsavedStatus() {
    hasUnsavedChanges = true;
    saveToServerButton.textContent = 'Save to Server *';
    saveToServerButton.style.backgroundColor = '#ffc107';
}

function clearUnsavedStatus() {
    hasUnsavedChanges = false;
    saveToServerButton.textContent = 'Save to Server';
    saveToServerButton.style.backgroundColor = '#28a745';
}

async function saveToServer() {
    if (!jsonData) {
        showStatus('No data to save', 'warning');
        return;
    }
    
    updateJsonData(); // Ensure we have the latest data
    
    saveToServerButton.disabled = true;
    saveToServerButton.textContent = 'Saving...';
    
    try {
        const response = await fetch('/save-json.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus(`✅ Saved successfully! ${result.pages_count} pages updated at ${result.timestamp}`, 'success');
            clearUnsavedStatus();
        } else {
            throw new Error(result.error || 'Unknown server error');
        }
        
    } catch (error) {
        console.error('Save error:', error);
        showStatus(`❌ Save failed: ${error.message}`, 'error');
    } finally {
        saveToServerButton.disabled = false;
        if (!hasUnsavedChanges) {
            saveToServerButton.textContent = 'Save to Server';
        } else {
            saveToServerButton.textContent = 'Save to Server *';
        }
    }
}

function fetchDataFromUrl() {
    showStatus('Loading data from server...', 'info');
    
    fetch('https://www.pinkmilkgames.nl/fun/JSON/escapedata.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            renderCurrentBlock();
            clearUnsavedStatus();
            showStatus('✅ Data loaded successfully from server', 'success');
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            showStatus('❌ Failed to load data from server', 'error');
        });
}

function renderCurrentBlock() {
    if (!jsonData) return;

    const totalPages = jsonData.pages.length;
    const startPage = currentBlock * 2;
    const endPage = Math.min(startPage + 2, totalPages);

    pagesContainer.innerHTML = '';
    for (let i = startPage; i < endPage; i++) {
        pagesContainer.appendChild(createPageEditor(jsonData.pages[i], i));
    }

    pageInfo.textContent = `${startPage + 1}-${endPage} / ${totalPages}`;
    prevButton.disabled = currentBlock === 0;
    nextButton.disabled = endPage === totalPages;
    
    // Add change listeners to detect edits
    addChangeListeners();
}

function addChangeListeners() {
    const inputs = pagesContainer.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updateUnsavedStatus);
    });
}

function createPageEditor(page, index) {
    const editor = document.createElement('div');
    editor.className = 'page-editor';
    editor.innerHTML = `
        <h2>Page ${page.pageNumber}</h2>
        <input type="text" id="kop-${index}" placeholder="Kop" value="${page.kop || ''}">
        <textarea id="bodyTxt-${index}" placeholder="Body Text">${page.bodyTxt || ''}</textarea>
        <input type="text" id="correctAnswer-${index}" placeholder="Correct Answer" value="${page.correctAnswer || ''}">
        ${[0, 1, 2, 3].map(hintIndex => `
            <input type="text" id="hint-${index}-${hintIndex}" placeholder="Hint ${hintIndex + 1}" value="${(page.hints && page.hints[hintIndex]) || ''}">
        `).join('')}
        <input type="text" id="nextPage-${index}" placeholder="Next Page URL" value="${page.nextPage || ''}">
    `;
    return editor;
}

function updateJsonData() {
    jsonData.pages.forEach((page, i) => {
        const kopElement = document.getElementById(`kop-${i}`);
        const bodyTxtElement = document.getElementById(`bodyTxt-${i}`);
        const correctAnswerElement = document.getElementById(`correctAnswer-${i}`);
        const nextPageElement = document.getElementById(`nextPage-${i}`);

        if (kopElement) page.kop = kopElement.value;
        if (bodyTxtElement) page.bodyTxt = bodyTxtElement.value;
        if (correctAnswerElement) page.correctAnswer = correctAnswerElement.value;
        if (nextPageElement) page.nextPage = nextPageElement.value;

        if (kopElement) {
            const newHints = [0, 1, 2, 3]
                .map(hintIndex => {
                    const hintElement = document.getElementById(`hint-${i}-${hintIndex}`);
                    return hintElement ? hintElement.value : (page.hints[hintIndex] || '');
                })
                .filter(hint => hint !== '');
            
            if (newHints.length > 0) {
                page.hints = newHints;
            }
        }
    });
}

function downloadJsonFile() {
    updateJsonData();
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escapedata.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('📁 JSON file downloaded to your computer', 'info');
}

function importJsonFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                jsonData = JSON.parse(e.target.result);
                renderCurrentBlock();
                updateUnsavedStatus();
                showStatus('✅ JSON imported from file - remember to save to server!', 'warning');
            } catch (error) {
                console.error('Error parsing JSON:', error);
                showStatus('❌ Failed to parse JSON file', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Auto-save functionality (optional - saves every 30 seconds if there are changes)
let autoSaveInterval;
function startAutoSave() {
    autoSaveInterval = setInterval(() => {
        if (hasUnsavedChanges && jsonData) {
            console.log('Auto-saving...');
            saveToServer();
        }
    }, 30000); // 30 seconds
}

// Warn before leaving with unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

// Event listeners
prevButton.addEventListener('click', () => {
    if (currentBlock > 0) {
        updateJsonData();
        currentBlock--;
        renderCurrentBlock();
    }
});

nextButton.addEventListener('click', () => {
    if ((currentBlock + 1) * 2 < jsonData.pages.length) {
        updateJsonData();
        currentBlock++;
        renderCurrentBlock();
    }
});

generateJsonButton.addEventListener('click', () => {
    updateJsonData();
    const jsonString = JSON.stringify(jsonData, null, 2);
    jsonOutput.value = jsonString;
    console.log('Updated JSON:', jsonString);
    downloadJsonButton.style.display = 'block';
});

downloadJsonButton.addEventListener('click', downloadJsonFile);
importFromFileButton.addEventListener('click', importJsonFromFile);
importFromUrlButton.addEventListener('click', fetchDataFromUrl);
saveToServerButton.addEventListener('click', saveToServer);

// Initialize
fetchDataFromUrl();
// startAutoSave(); // Uncomment this if you want auto-save every 30 seconds
