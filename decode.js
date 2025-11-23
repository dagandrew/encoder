const secretWordInput = document.getElementById('secretWord');
const entriesContainer = document.getElementById('entriesContainer');
const totalEntriesEl = document.getElementById('totalEntries');
let DATABASE = [];

function generateKey(secretWord, length) {
    if (!secretWord) return '';
    let key = '';
    for (let i = 0; i < length; i++) {
        key += secretWord[i % secretWord.length];
    }
    return key;
}

function decode(encodedText, secretWord) {
    if (!secretWord || !encodedText) return '';
    try {
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
        return '[Decoding error]';
    }
}

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
        alert('Please enter your master secret word first!');
        return;
    }

    const entry = DATABASE[index];
    const result = decode(entry.encoded, secret);
    copyToClipboard(result, buttonId);
}

function toggleDecoded(index) {
    const decodedContent = document.getElementById(`decoded-content-${index}`);
    const showBtn = document.getElementById(`show-btn-${index}`);
    const hideBtn = document.getElementById(`hide-btn-${index}`);
    const decodedTextEl = document.getElementById(`decoded-text-${index}`);

    const secret = secretWordInput.value.trim();
    if (!secret) {
        alert('Please enter your master secret word first!');
        return;
    }

    if (decodedContent.classList.contains('visible')) {
        decodedContent.classList.remove('visible');
        showBtn.style.display = 'inline-flex';
        hideBtn.style.display = 'none';
    } else {
        const entry = DATABASE[index];
        const result = decode(entry.encoded, secret);
        decodedTextEl.textContent = result;
        decodedContent.classList.add('visible');
        showBtn.style.display = 'none';
        hideBtn.style.display = 'inline-flex';
    }
}

function createEntryCard(entry, index) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
        <div class="entry-title">${entry.title}</div>
        <div class="encoded-section">
            <div class="section-label">🔒 Encoded Message</div>
            <div class="encoded-text">${entry.encoded}</div>
        </div>
        <div class="decoded-section">
            <div class="button-group">
                <button class="btn btn-quick-copy" id="quick-copy-btn-${index}" onclick="quickCopy(${index}, 'quick-copy-btn-${index}')">
                    ⚡ Quick Copy
                </button>
                <button class="btn btn-show" id="show-btn-${index}" onclick="toggleDecoded(${index})">
                    👁️ Show
                </button>
                <button class="btn btn-hide" id="hide-btn-${index}" onclick="toggleDecoded(${index})" style="display: none;">
                    🙈 Hide
                </button>
            </div>
            <div class="decoded-content" id="decoded-content-${index}">
                <div class="section-label">📝 Decoded Password</div>
                <div class="decoded-text" id="decoded-text-${index}"></div>
                <div class="button-group">
                    <button class="btn btn-copy" id="copy-btn-${index}" onclick="copyToClipboard(document.getElementById('decoded-text-${index}').textContent, 'copy-btn-${index}')">
                        📋 Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    `;
    return card;
}

function initializeEntries() {
    entriesContainer.innerHTML = '';
    DATABASE.forEach((entry, index) => {
        entriesContainer.appendChild(createEntryCard(entry, index));
    });
    totalEntriesEl.textContent = DATABASE.length;
}

// Load database from passwords.js
DATABASE = PASSWORDS_DATABASE;
initializeEntries();
