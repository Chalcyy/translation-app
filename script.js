// DOM Elements
const sourceTextEl = document.getElementById('sourceText');
const translatedTextEl = document.getElementById('translatedText');
const sourceLangEl = document.getElementById('sourceLang');
const targetLangEl = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const swapBtn = document.getElementById('swapBtn');
const copyBtn = document.getElementById('copyBtn');
const speakSourceBtn = document.getElementById('speakSourceBtn');
const speakTargetBtn = document.getElementById('speakTargetBtn');
const charCountEl = document.getElementById('charCount');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const copyMessageEl = document.getElementById('copyMessage');

// State
let currentTranslation = '';

// Character count update
sourceTextEl.addEventListener('input', () => {
    const length = sourceTextEl.value.length;
    charCountEl.textContent = `${length} characters`;
});

// Translate function using MyMemory API
async function translateText() {
    const text = sourceTextEl.value.trim();
    
    if (!text) {
        translatedTextEl.innerHTML = '<span class="placeholder">Translation will appear here...</span>';
        return;
    }

    const sourceLang = sourceLangEl.value;
    const targetLang = targetLangEl.value;

    // Show loading
    loadingEl.classList.add('show');
    errorEl.classList.remove('show');
    translateBtn.disabled = true;
    translatedTextEl.innerHTML = '<span class="placeholder">Translating...</span>';

    try {
        // MyMemory API endpoint
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            currentTranslation = data.responseData.translatedText;
            translatedTextEl.textContent = currentTranslation;
            errorEl.classList.remove('show');
        } else {
            throw new Error('Translation not available');
        }
    } catch (error) {
        console.error('Translation error:', error);
        errorEl.textContent = 'Translation failed. Please try again or check your internet connection.';
        errorEl.classList.add('show');
        translatedTextEl.innerHTML = '<span class="placeholder">Translation failed</span>';
    } finally {
        loadingEl.classList.remove('show');
        translateBtn.disabled = false;
    }
}

// Swap languages
function swapLanguages() {
    const tempLang = sourceLangEl.value;
    sourceLangEl.value = targetLangEl.value;
    targetLangEl.value = tempLang;

    const tempText = sourceTextEl.value;
    sourceTextEl.value = currentTranslation;
    
    if (currentTranslation) {
        translatedTextEl.textContent = tempText;
        currentTranslation = tempText;
    }

    // Update character count
    charCountEl.textContent = `${sourceTextEl.value.length} characters`;
}

// Copy to clipboard
async function copyToClipboard() {
    if (!currentTranslation) return;

    try {
        await navigator.clipboard.writeText(currentTranslation);
        copyMessageEl.classList.add('show');
        setTimeout(() => {
            copyMessageEl.classList.remove('show');
        }, 2000);
    } catch (error) {
        console.error('Failed to copy:', error);
        alert('Copied: ' + currentTranslation);
    }
}

// Text to speech
function speakText(text, lang) {
    if (!text) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
}

// Event listeners
translateBtn.addEventListener('click', translateText);
swapBtn.addEventListener('click', swapLanguages);
copyBtn.addEventListener('click', copyToClipboard);

speakSourceBtn.addEventListener('click', () => {
    const text = sourceTextEl.value.trim();
    if (text) {
        speakText(text, sourceLangEl.value);
    }
});

speakTargetBtn.addEventListener('click', () => {
    if (currentTranslation) {
        speakText(currentTranslation, targetLangEl.value);
    }
});

// Enter key to translate (Ctrl/Cmd + Enter)
sourceTextEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        translateText();
    }
});

// Log for debugging
console.log('Translation app loaded successfully!');