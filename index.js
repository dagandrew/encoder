const secretWordInput = document.getElementById('secretWord');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const inputCount = document.getElementById('inputCount');
const outputCount = document.getElementById('outputCount');
const entriesContainer = document.getElementById('entriesContainer');
const totalEntriesEl = document.getElementById('totalEntries');
let DATABASE = [];

// Encoding/Decoding algorithm based on secret word
function generateKey(secretWord, length) {
    if (!secretWord) return '';
    let key = '';
    for (let i = 0; i < length; i++) {
        key += secretWord[i % secretWord.length];
    }
    return key;
}

function encode(text, secretWord) {
    if (!secretWord || !text) return text;

    const key = generateKey(secretWord, text.length);
    let encoded = '';

    for (let i = 0; i < text.length; i++) {
        const textChar = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i);
        const encodedChar = textChar + keyChar;
        encoded += String.fromCharCode(encodedChar);
    }

    // Convert to base64 for better representation
    return btoa(encoded);
}

function decode(encodedText, secretWord) {
    if (!secretWord || !encodedText) return '';

    try {
        // Decode from base64
        const decoded = atob(encodedText);
        const key = generateKey(secretWord, decoded.length);
        let original = '';

        for (let i = 0; i < decoded.length; i++) {
            const encodedChar = decoded.charCodeAt(i);
            const keyChar = key.charCodeAt(i);
            const originalChar = encodedChar - keyChar;
            original += String.fromCharCode(originalChar);
        }

        return original;
    } catch (e) {
        return '[Invalid encoded text or wrong secret word]';
    }
}

function processText() {
    const secret = secretWordInput.value.trim();
    const input = inputText.value;
    const isDecodeMode = modeToggle.checked;

    if (!secret) {
        outputText.value = '[Please enter a secret word first]';
        return;
    }

    if (!input) {
        outputText.value = '';
        return;
    }

    if (isDecodeMode) {
        outputText.value = decode(input, secret);
    } else {
        outputText.value = encode(input, secret);
    }

    updateCharCount();
}

function updateCharCount() {
    inputCount.textContent = `${inputText.value.length} characters`;
    outputCount.textContent = `${outputText.value.length} characters`;
}

function updateModeLabel() {
    // Just toggle font-weights between ENCODE and DECODE labels
    modeLabel.style.fontWeight = modeToggle.checked ? '400' : '600';
    document.querySelectorAll('.mode-label')[1].style.fontWeight = modeToggle.checked ? '600' : '400';
}

// Database-related functionality
function copyToClipboard(text, buttonId) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById(buttonId);
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => console.error('Failed to copy:', err));
}

function quickCopy(index, buttonId) {
    const secret = secretWordInput.value.trim();
    if (!secret) {
        alert('Please enter your secret word first!');
        return;
    }

    const entry = DATABASE[index];
    const result = decode(entry.encoded, secret);
    copyToClipboard(result, buttonId);
}

function toggleDecoded(index) {
    const decodedSection = document.getElementById(`decoded-section-${index}`);
    const decodedContent = document.getElementById(`decoded-content-${index}`);
    const showBtn = document.getElementById(`show-btn-${index}`);
    const hideBtn = document.getElementById(`hide-btn-${index}`);
    const decodedTextEl = document.getElementById(`decoded-text-${index}`);

    const secret = secretWordInput.value.trim();
    if (!secret) {
        alert('Please enter your secret word first!');
        return;
    }

    if (decodedContent.classList.contains('visible')) {
        decodedContent.classList.remove('visible');
        decodedSection.style.display = 'none';
        showBtn.style.display = 'inline-flex';
        hideBtn.style.display = 'none';
    } else {
        const entry = DATABASE[index];
        const result = decode(entry.encoded, secret);
        decodedTextEl.textContent = result;
        decodedSection.style.display = 'block';
        decodedContent.classList.add('visible');
        showBtn.style.display = 'none';
        hideBtn.style.display = 'inline-flex';
    }
}

function createEntryCard(entry, index) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
        <div class="entry-header">
            <div class="entry-title">${entry.title}</div>
            <div class="button-group">
                <button class="btn btn-quick-copy" id="quick-copy-btn-${index}" onclick="quickCopy(${index}, 'quick-copy-btn-${index}')">
                    ⚡ Copy
                </button>
                <button class="btn btn-show" id="show-btn-${index}" onclick="toggleDecoded(${index})">
                    👁️ Show
                </button>
                <button class="btn btn-hide" id="hide-btn-${index}" onclick="toggleDecoded(${index})" style="display: none;">
                    🙈 Hide
                </button>
            </div>
        </div>
        <div class="encoded-section">
            <div class="section-label">🔒 Encoded</div>
            <div class="encoded-text">${entry.encoded}</div>
        </div>
        <div class="decoded-section" id="decoded-section-${index}" style="display: none;">
            <div class="decoded-content" id="decoded-content-${index}">
                <div class="section-label">📝 Decoded</div>
                <div class="decoded-text" id="decoded-text-${index}"></div>
            </div>
        </div>
    `;
    return card;
}

function initializeEntries() {
    if (!entriesContainer) return;
    entriesContainer.innerHTML = '';
    DATABASE.forEach((entry, index) => {
        entriesContainer.appendChild(createEntryCard(entry, index));
    });
    if (totalEntriesEl) totalEntriesEl.textContent = DATABASE.length;
}

// Event listeners
secretWordInput.addEventListener('input', () => {
    processText();
    // Close all open decodings when secret word changes for security and correctness
    document.querySelectorAll('.decoded-content').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.btn-show').forEach(el => el.style.display = 'inline-flex');
    document.querySelectorAll('.btn-hide').forEach(el => el.style.display = 'none');
});
inputText.addEventListener('input', () => {
    processText();
    updateCharCount();
});
modeToggle.addEventListener('change', () => {
    updateModeLabel();
    processText();
});

// Initialize
DATABASE = typeof PASSWORDS_DATABASE !== 'undefined' ? PASSWORDS_DATABASE : [];
initializeEntries();
updateCharCount();
updateModeLabel();
