(function () {
  'use strict';

  const state = {
    hasDocument: false,
    documentName: null,
    soundEnabled: localStorage.getItem('sparky_sound') !== 'false',
    themeIndex: 0,
    themes: ['theme-cyber', 'theme-candy', 'theme-dark', 'theme-light'],
    themeNames: ['Neon Cyber', 'Candy Pop', 'Dark Nebula', 'Crisp Light'],
    messageCount: 0,
    pokeCount: 0,
    isProcessing: false,
    isRecording: false,
    activeSpeechUtterance: null,
  };

  const quotes = [
    "BEEP BOOP! You found my tickle spot! 🤖",
    "Did you know? LangChain connects my thoughts like neural fireworks! ✨",
    "Feed me dense PDFs! I eat tables, citations, and summaries for breakfast. 🥞",
    "My pupils follow you wherever you go! 👀",
    "10100110101... in robot language that means 'You're awesome!' 🚀",
    "Vector embeddings are like maps of meaning in high-dimensional space! 🌌",
    "Ask me to quiz you or summarize anything once you upload a file! 🎯"
  ];

  class SoundEngine {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
      }
    }

    pop() {
      this.playTone(520, 'sine', 0.08, 0.12);
    }

    poke() {
      if (!state.soundEnabled) return;
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.12, 0.14), i * 65);
      });
    }

    send() {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, this.ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
      } catch (e) {}
    }

    receive() {
      if (!state.soundEnabled) return;
      const notes = [659.25, 880, 1046.5];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.1), i * 90);
      });
    }

    celebrate() {
      if (!state.soundEnabled) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.16), i * 85);
      });
    }

    error() {
      this.playTone(180, 'sawtooth', 0.25, 0.15);
    }
  }

  const audio = new SoundEngine();

  class ConfettiEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.running = false;
      this.colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#38bdf8', '#10b981', '#f59e0b', '#ffffff'];
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 70) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 12;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: 6 + Math.random() * 8,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 14,
          gravity: 0.28,
          drag: 0.98,
          opacity: 1,
          shape: Math.random() > 0.4 ? 'rect' : 'circle'
        });
      }

      if (!this.running) {
        this.running = true;
        this.animate();
      }
    }

    animate() {
      if (this.particles.length === 0) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.running = false;
        return;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  const confetti = new ConfettiEngine('confetti-canvas');

  function initAmbientCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const count = 38;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1.5 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.5,
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();
      }

      requestAnimationFrame(render);
    }
    render();
  }

  function initMascotEngine() {
    const leftPupil = document.getElementById('left-pupil');
    const rightPupil = document.getElementById('right-pupil');
    const mascotSvg = document.getElementById('sparky-svg');
    const mascotCard = document.getElementById('mascot-card');
    const bubble = document.getElementById('mascot-bubble');
    const speechText = document.getElementById('mascot-speech-text');
    const pokeCountElem = document.getElementById('poke-count');
    const moodText = document.getElementById('mascot-mood-text');
    const clickableArea = document.getElementById('mascot-clickable-area');

    let currentPupilX = 0;
    let currentPupilY = 0;
    let targetPupilX = 0;
    let targetPupilY = 0;

    window.addEventListener('mousemove', (e) => {
      if (!leftPupil || !rightPupil) return;
      const rect = mascotSvg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 9;

      if (dist > 0) {
        const clampedDist = Math.min(dist / 25, maxDistance);
        targetPupilX = (deltaX / dist) * clampedDist;
        targetPupilY = (deltaY / dist) * clampedDist;
      }
    });

    function updatePupils() {
      currentPupilX += (targetPupilX - currentPupilX) * 0.15;
      currentPupilY += (targetPupilY - currentPupilY) * 0.15;

      if (leftPupil && rightPupil) {
        leftPupil.setAttribute('transform', `translate(${currentPupilX.toFixed(2)}, ${currentPupilY.toFixed(2)})`);
        rightPupil.setAttribute('transform', `translate(${currentPupilX.toFixed(2)}, ${currentPupilY.toFixed(2)})`);
      }
      requestAnimationFrame(updatePupils);
    }
    updatePupils();

    function triggerBlink() {
      mascotSvg.classList.add('blink');
      setTimeout(() => {
        mascotSvg.classList.remove('blink');
        scheduleNextBlink();
      }, 140);
    }

    function scheduleNextBlink() {
      const delay = 2800 + Math.random() * 3500;
      setTimeout(triggerBlink, delay);
    }
    scheduleNextBlink();

    clickableArea.addEventListener('click', (e) => {
      audio.poke();
      state.pokeCount++;
      pokeCountElem.textContent = state.pokeCount;

      mascotCard.classList.remove('wobble-poke');
      void mascotCard.offsetWidth;
      mascotCard.classList.add('wobble-poke');

      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      speechText.textContent = quote;
      bubble.style.display = 'block';

      confetti.burst(e.clientX, e.clientY, 20);

      moodText.textContent = 'Tickled & Excited! ⚡';
      setTimeout(() => {
        if (!state.isProcessing) {
          moodText.textContent = state.hasDocument ? 'Ready for Questions' : 'Happy & Curious';
        }
      }, 3000);
    });
  }

  function showToast(message, type = 'info', icon = '✨') {
    const stack = document.getElementById('toast-stack');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-message">${message}</div>
    `;
    stack.appendChild(toast);

    if (type === 'success') audio.celebrate();
    else if (type === 'error') audio.error();
    else audio.pop();

    setTimeout(() => {
      toast.classList.add('toast-closing');
      setTimeout(() => toast.remove(), 350);
    }, 3800);
  }

  function setSystemStatus(status, text) {
    const dot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const vaultTag = document.getElementById('vault-status-tag');
    const chatDocPill = document.getElementById('current-doc-pill');
    const headerDot = document.getElementById('chat-header-dot');

    dot.className = 'status-pulse-dot';
    headerDot.className = 'avatar-live-dot';

    if (status === 'ready') {
      dot.classList.add('ready');
      headerDot.classList.add('active');
      statusText.textContent = text || 'Document Indexed & Ready';
      vaultTag.className = 'vault-tag ready';
      vaultTag.textContent = 'Ready';
      chatDocPill.textContent = state.documentName ? `Doc: ${state.documentName}` : 'PDF Indexed';
    } else if (status === 'processing') {
      dot.classList.add('processing');
      statusText.textContent = text || 'Quantum Indexing...';
      vaultTag.className = 'vault-tag';
      vaultTag.textContent = 'Scanning';
    } else {
      statusText.textContent = text || 'Awaiting PDF Document';
      vaultTag.className = 'vault-tag';
      vaultTag.textContent = 'Empty';
      chatDocPill.textContent = 'No PDF Attached';
    }
  }

  function initUploadEngine() {
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const idleView = document.getElementById('dropzone-idle');
    const scannerView = document.getElementById('dropzone-scanner');
    const readyView = document.getElementById('dropzone-ready');
    const readyFilename = document.getElementById('ready-filename');
    const readyFileSize = document.getElementById('ready-file-size');
    const changeDocBtn = document.getElementById('change-doc-btn');
    const dockAttachBtn = document.getElementById('dock-attach-btn');
    const stepUploadCard = document.getElementById('step-upload-card');
    const progressBar = document.getElementById('scanner-progress-fill');
    const scannerSubtext = document.getElementById('scanner-subtext');

    function openFilePicker() {
      audio.pop();
      fileInput.click();
    }

    idleView.addEventListener('click', openFilePicker);
    changeDocBtn.addEventListener('click', openFilePicker);
    dockAttachBtn.addEventListener('click', openFilePicker);
    if (stepUploadCard) stepUploadCard.addEventListener('click', openFilePicker);

    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-active');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFileSelection(fileInput.files[0]);
      }
    });

    async function handleFileSelection(file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please choose a valid .PDF document!', 'error', '⚠️');
        return;
      }

      idleView.style.display = 'none';
      readyView.style.display = 'none';
      scannerView.style.display = 'block';
      setSystemStatus('processing', 'Reading & Splitting PDF...');

      let progress = 15;
      progressBar.style.width = '15%';
      const stages = [
        "Parsing document structure & pages...",
        "Splitting text into overlapping chunks...",
        "Generating HuggingFace vector embeddings...",
        "Building local Chroma vector retrieval index..."
      ];
      let stageIdx = 0;
      const progressTimer = setInterval(() => {
        if (progress < 85) {
          progress += Math.floor(Math.random() * 12) + 5;
          progressBar.style.width = `${Math.min(progress, 88)}%`;
          stageIdx = (stageIdx + 1) % stages.length;
          scannerSubtext.textContent = stages[stageIdx];
        }
      }, 650);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/process-document', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressTimer);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to process document');
        }

        progressBar.style.width = '100%';
        scannerSubtext.textContent = 'Complete!';

        setTimeout(() => {
          scannerView.style.display = 'none';
          readyView.style.display = 'block';

          state.hasDocument = true;
          state.documentName = file.name;

          readyFilename.textContent = file.name;
          const sizeKb = (file.size / 1024).toFixed(1);
          readyFileSize.textContent = `${sizeKb} KB`;

          setSystemStatus('ready', `Indexed: ${file.name}`);
          showToast(`"${file.name}" indexed successfully!`, 'success', '🎉');

          confetti.burst(window.innerWidth * 0.25, window.innerHeight * 0.45, 90);

          hideWelcomeHero();
          appendBotMessage(result.botResponse || `🎉 I'm ready to answer any questions about **${file.name}**!`);
        }, 500);

      } catch (err) {
        clearInterval(progressTimer);
        scannerView.style.display = 'none';
        idleView.style.display = 'block';
        setSystemStatus('idle');
        showToast(err.message, 'error', '❌');
      }
    }
  }

  function parseSimpleMarkdown(text) {
    if (!text) return '';
    let parsed = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/(?:^|\n)-\s+(.*)/g, '<li>$1</li>');

    if (parsed.includes('<li>')) {
      parsed = parsed.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    }

    const paragraphs = parsed.split(/\n\n+/).map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<pre>') || p.startsWith('<ul>')) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    });

    return paragraphs.join('');
  }

  function hideWelcomeHero() {
    const hero = document.getElementById('welcome-hero');
    if (hero) hero.style.display = 'none';
  }

  function scrollToBottom() {
    const viewport = document.getElementById('messages-viewport');
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: 'smooth'
    });
  }

  function appendUserMessage(text) {
    hideWelcomeHero();
    const list = document.getElementById('messages-list');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const row = document.createElement('div');
    row.className = 'message-row user';
    row.innerHTML = `
      <div class="msg-avatar">🧑‍💻</div>
      <div class="msg-body-wrapper">
        <div class="message-bubble">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <div class="msg-meta-bar">
          <span>${timeStr}</span>
        </div>
      </div>
    `;

    list.appendChild(row);
    state.messageCount++;
    document.getElementById('metric-msg-count').textContent = state.messageCount;
    audio.send();
    scrollToBottom();
  }

  function appendBotMessage(rawText) {
    hideWelcomeHero();
    const list = document.getElementById('messages-list');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedHtml = parseSimpleMarkdown(rawText);

    const row = document.createElement('div');
    row.className = 'message-row bot';
    row.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body-wrapper">
        <div class="message-bubble">${formattedHtml}</div>
        <div class="msg-meta-bar">
          <span>${timeStr}</span>
          <div class="msg-actions-group">
            <button class="msg-action-btn copy-btn" title="Copy text to clipboard">
              <span>📋</span><span class="btn-text">Copy</span>
            </button>
            <button class="msg-action-btn tts-btn" title="Read message aloud">
              <span>🔊</span><span>Speak</span>
            </button>
            <button class="reaction-chip" data-emoji="👍" title="Helpful!">👍</button>
            <button class="reaction-chip" data-emoji="💡" title="Brilliant!">💡</button>
            <button class="reaction-chip" data-emoji="🚀" title="Superb!">🚀</button>
          </div>
        </div>
      </div>
    `;

    const copyBtn = row.querySelector('.copy-btn');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(rawText);
        copyBtn.querySelector('.btn-text').textContent = 'Copied!';
        audio.pop();
        setTimeout(() => {
          copyBtn.querySelector('.btn-text').textContent = 'Copy';
        }, 2000);
      } catch (err) {
        showToast('Could not copy to clipboard', 'error');
      }
    });

    const ttsBtn = row.querySelector('.tts-btn');
    ttsBtn.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) {
        showToast('Speech synthesis is not supported in this browser.', 'info');
        return;
      }

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        ttsBtn.classList.remove('speaking');
        return;
      }

      const cleanText = rawText.replace(/[#*`_-]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;

      ttsBtn.classList.add('speaking');
      utterance.onend = () => ttsBtn.classList.remove('speaking');
      utterance.onerror = () => ttsBtn.classList.remove('speaking');

      window.speechSynthesis.speak(utterance);
    });

    row.querySelectorAll('.reaction-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        audio.pop();
        chip.style.transform = 'scale(1.4)';
        setTimeout(() => chip.style.transform = '', 200);
        confetti.burst(e.clientX, e.clientY, 15);
      });
    });

    list.appendChild(row);
    state.messageCount++;
    document.getElementById('metric-msg-count').textContent = state.messageCount;
    audio.receive();
    scrollToBottom();
  }

  function showTypingIndicator(show, label = 'Sparky is thinking...') {
    const indicator = document.getElementById('typing-indicator');
    const labelElem = document.getElementById('typing-label');
    const moodText = document.getElementById('mascot-mood-text');

    if (show) {
      labelElem.textContent = label;
      indicator.style.display = 'flex';
      moodText.textContent = 'Thinking & Querying... 🧠';
      scrollToBottom();
    } else {
      indicator.style.display = 'none';
      moodText.textContent = state.hasDocument ? 'Ready for Questions' : 'Happy & Curious';
    }
  }

  async function handleSendMessage() {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const userText = input.value.trim();

    if (!userText || state.isProcessing) return;

    if (!state.hasDocument) {
      audio.error();
      showToast('Please upload a PDF document before asking questions!', 'error', '📄');
      const dropzone = document.getElementById('file-dropzone');
      dropzone.scrollIntoView({ behavior: 'smooth' });
      dropzone.classList.add('wobble-poke');
      setTimeout(() => dropzone.classList.remove('wobble-poke'), 700);
      return;
    }

    sendBtn.classList.add('launching');
    setTimeout(() => sendBtn.classList.remove('launching'), 600);

    input.value = '';
    input.style.height = 'auto';

    appendUserMessage(userText);
    state.isProcessing = true;
    showTypingIndicator(true, 'Scanning document embeddings...');

    try {
      const response = await fetch('/process-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userText }),
      });

      const data = await response.json();
      showTypingIndicator(false);

      if (!response.ok) {
        throw new Error(data.error || 'The bot could not process the question.');
      }

      appendBotMessage(data.botResponse);

    } catch (err) {
      showTypingIndicator(false);
      showToast(err.message, 'error', '⚠️');
      appendBotMessage(`⚠️ **Oops!** ${err.message}`);
    } finally {
      state.isProcessing = false;
    }
  }

  function initVoiceEngine() {
    const voiceBtn = document.getElementById('voice-input-btn');
    const input = document.getElementById('message-input');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      voiceBtn.title = 'Speech Recognition not supported in this browser';
      voiceBtn.style.opacity = '0.5';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      state.isRecording = true;
      voiceBtn.classList.add('recording');
      audio.pop();
      showToast('Listening... Speak now!', 'info', '🎙️');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = (input.value + ' ' + transcript).trim();
      input.focus();
      audio.pop();
    };

    recognition.onerror = () => {
      state.isRecording = false;
      voiceBtn.classList.remove('recording');
      showToast('Voice input stopped or encountered an issue', 'info');
    };

    recognition.onend = () => {
      state.isRecording = false;
      voiceBtn.classList.remove('recording');
    };

    voiceBtn.addEventListener('click', () => {
      if (state.isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }

  function initApp() {
    initAmbientCanvas();
    initMascotEngine();
    initUploadEngine();
    initVoiceEngine();

    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });

    sendButton.addEventListener('click', handleSendMessage);

    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        audio.pop();
        const prompt = chip.getAttribute('data-prompt');
        messageInput.value = prompt;
        messageInput.focus();
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';

        if (state.hasDocument) {
          handleSendMessage();
        } else {
          showToast('Uploaded a PDF? Click Send or drop your file first!', 'info', '💡');
        }
      });
    });

    const themeBtn = document.getElementById('theme-cycle-btn');
    const themeNameElem = document.getElementById('theme-name');
    themeBtn.addEventListener('click', () => {
      audio.pop();
      document.body.classList.remove(state.themes[state.themeIndex]);
      state.themeIndex = (state.themeIndex + 1) % state.themes.length;
      document.body.classList.add(state.themes[state.themeIndex]);
      themeNameElem.textContent = state.themeNames[state.themeIndex];
      showToast(`Switched theme to ${state.themeNames[state.themeIndex]}!`, 'info', '🎨');
    });

    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem('sparky_sound', state.soundEnabled);
      if (state.soundEnabled) {
        soundBtn.classList.remove('muted');
        soundIcon.textContent = '🔊';
        audio.pop();
        showToast('Sound effects enabled!', 'info', '🔔');
      } else {
        soundBtn.classList.add('muted');
        soundIcon.textContent = '🔇';
        showToast('Sound effects muted', 'info', '🔕');
      }
    });

    if (!state.soundEnabled) {
      soundBtn.classList.add('muted');
      soundIcon.textContent = '🔇';
    }

    const partyBtn = document.getElementById('confetti-burst-btn');
    partyBtn.addEventListener('click', (e) => {
      audio.celebrate();
      confetti.burst(e.clientX, e.clientY, 80);
      showToast('Party time! 🎉 Keep exploring!', 'info', '🥳');
    });

    const resetBtn = document.getElementById('session-reset-btn');
    resetBtn.addEventListener('click', async () => {
      audio.pop();
      try {
        await fetch('/reset', { method: 'POST' });
        state.hasDocument = false;
        state.documentName = null;
        state.messageCount = 0;
        document.getElementById('metric-msg-count').textContent = '0';
        document.getElementById('messages-list').innerHTML = '';

        document.getElementById('dropzone-idle').style.display = 'block';
        document.getElementById('dropzone-scanner').style.display = 'none';
        document.getElementById('dropzone-ready').style.display = 'none';
        document.getElementById('welcome-hero').style.display = 'flex';

        setSystemStatus('idle');
        showToast('Brain memory cleared! Drop a new PDF to start fresh.', 'info', '🔄');
      } catch (e) {
        showToast('Could not reset session', 'error');
      }
    });

    const fidgetDice = document.getElementById('fidget-dice-btn');
    const randomPrompts = [
      "What is the most surprising fact or insight in this document?",
      "Can you give me 3 key takeaways with actionable advice?",
      "If you had to summarize this document in one single tweet, what would it say?",
      "Identify the core assumptions made by the authors.",
      "What problem does this document attempt to solve, and how?"
    ];
    fidgetDice.addEventListener('click', () => {
      audio.pop();
      const p = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
      messageInput.value = p;
      messageInput.focus();
      showToast('Random question spark loaded!', 'info', '🎲');
    });

    const fidgetBubble = document.getElementById('fidget-bubble-btn');
    fidgetBubble.addEventListener('click', (e) => {
      audio.pop();
      confetti.burst(e.clientX, e.clientY, 15);
    });

    fetch('/status')
      .then(res => res.json())
      .then(data => {
        if (data.hasDocument) {
          state.hasDocument = true;
          state.documentName = data.documentName || 'Loaded Document';
          document.getElementById('dropzone-idle').style.display = 'none';
          document.getElementById('dropzone-ready').style.display = 'block';
          document.getElementById('ready-filename').textContent = state.documentName;
          setSystemStatus('ready', `Indexed: ${state.documentName}`);
        } else {
          setSystemStatus('idle');
        }
      })
      .catch(() => {
        setSystemStatus('idle');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
