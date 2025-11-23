const secretWordInput = document.getElementById('secretWord');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const inputCount = document.getElementById('inputCount');
const outputCount = document.getElementById('outputCount');

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
    if (!secretWord || !encodedText) return encodedText;

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

// Event listeners
secretWordInput.addEventListener('input', processText);
inputText.addEventListener('input', () => {
    processText();
    updateCharCount();
});
modeToggle.addEventListener('change', () => {
    updateModeLabel();
    processText();
});

// Initialize
updateCharCount();
updateModeLabel();
