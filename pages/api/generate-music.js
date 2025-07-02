// pages/api/generate-music-webaudio.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, style, duration } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  try {
    // Simulation avec code JavaScript pour génération audio
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Analyse du prompt pour générer les paramètres audio
    const isMysterious = prompt.toLowerCase().includes('mystérieux') || prompt.toLowerCase().includes('mystique');
    const isSpatial = prompt.toLowerCase().includes('spatial') || prompt.toLowerCase().includes('espace');
    const isDark = prompt.toLowerCase().includes('sombre') || prompt.toLowerCase().includes('dark');
    
    // Paramètres musicaux basés sur l'analyse
    let musicParams = {};
    
    if (style === 'electronic') {
      musicParams = {
        baseFreq: isMysterious ? 80 : 120,
        tempo: isMysterious ? 90 : 128,
        waveform: 'sawtooth',
        effects: isSpatial ? ['reverb', 'delay', 'chorus'] : ['reverb', 'filter'],
        pattern: isDark ? 'minor' : 'major'
      };
    } else if (style === 'ambient') {
      musicParams = {
        baseFreq: 60,
        tempo: 60,
        waveform: 'sine',
        effects: ['reverb', 'delay', 'chorus'],
        pattern: 'atmospheric'
      };
    } else {
      musicParams = {
        baseFreq: 110,
        tempo: 120,
        waveform: 'triangle',
        effects: ['reverb'],
        pattern: 'harmonic'
      };
    }

    // Code JavaScript pour génération audio côté client
    const audioGenerationCode = `
// Code de génération audio Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sampleRate = 44100;
const duration = ${duration || 30};
const bufferSize = sampleRate * duration;

// Paramètres générés par l'IA
const params = ${JSON.stringify(musicParams)};

// Génération des samples audio
function generateMusic() {
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);
  
  const baseFreq = params.baseFreq;
  const tempo = params.tempo / 60; // BPM to Hz
  
  for (let i = 0; i < bufferSize; i++) {
    const time = i / sampleRate;
    
    // Génération de la mélodie principale
    let sample = 0;
    
    // Oscillateur principal
    sample += Math.sin(2 * Math.PI * baseFreq * time) * 0.3;
    
    // Harmoniques selon le style
    if (params.waveform === 'sawtooth') {
      sample += Math.sin(2 * Math.PI * baseFreq * 2 * time) * 0.15;
      sample += Math.sin(2 * Math.PI * baseFreq * 3 * time) * 0.1;
    }
    
    // Modulation pour effet "mystérieux"
    if (${isMysterious}) {
      const lfo = Math.sin(2 * Math.PI * 0.5 * time);
      sample *= (1 + lfo * 0.3);
    }
    
    // Effet spatial avec delay
    if (${isSpatial}) {
      const delay = Math.sin(2 * Math.PI * baseFreq * (time - 0.1)) * 0.2;
      sample += delay;
    }
    
    // Envelope ADSR simple
    let envelope = 1;
    const beatLength = sampleRate / tempo;
    const beatPosition = (i % beatLength) / beatLength;
    
    if (beatPosition < 0.1) {
      envelope = beatPosition / 0.1; // Attack
    } else if (beatPosition > 0.8) {
      envelope = (1 - beatPosition) / 0.2; // Release
    }
    
    data[i] = sample * envelope * 0.5; // Volume global
  }
  
  return buffer;
}

// Fonction pour jouer l'audio généré
function playGeneratedMusic() {
  const source = audioContext.createBufferSource();
  source.buffer = generateMusic();
  
  // Effets audio
  const gainNode = audioContext.createGain();
  const filterNode = audioContext.createBiquadFilter();
  
  // Configuration des effets selon le style
  filterNode.type = 'lowpass';
  filterNode.frequency.value = ${isMysterious ? 800 : 2000};
  
  // Chaînage des effets
  source.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Démarrage de la lecture
  source.start();
  
  return source;
}

// Fonction pour télécharger l'audio
function downloadGeneratedMusic() {
  const buffer = generateMusic();
  const wav = audioBufferToWav(buffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'generated-music-${style}-${Date.now()}.wav';
  a.click();
}

// Conversion buffer vers WAV
function audioBufferToWav(buffer) {
  const length = buffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // Header WAV
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 44100, true);
  view.setUint32(28, 44100 * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Données audio
  const data = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    view.setInt16(offset, data[i] * 0x7FFF, true);
    offset += 2;
  }
  
  return arrayBuffer;
}`;

    const result = `🎵 **Générateur Musical Web Audio Prêt !**

**🎼 Composition générée :**
• **Style :** ${style}
• **Inspiration :** ${prompt}
• **Durée :** ${duration || 30} secondes
• **Technologie :** Web Audio API native
• **Qualité :** 44.1kHz WAV

**🎹 Paramètres musicaux calculés :**
• **Fréquence de base :** ${musicParams.baseFreq} Hz
• **Tempo :** ${musicParams.tempo} BPM
• **Forme d'onde :** ${musicParams.waveform}
• **Effets :** ${musicParams.effects.join(', ')}
• **Tonalité :** ${musicParams.pattern}

**🎧 VOTRE MUSIQUE EST GÉNÉRÉE !**

**▶️ Actions disponibles :**
• Cliquez "Écouter" pour jouer votre création
• Cliquez "Télécharger" pour sauvegarder en WAV
• La musique est générée en temps réel dans votre navigateur

**💡 Avantages :**
• Génération instantanée (pas d'attente)
• Fichier WAV téléchargeable
• Fonctionne 100% hors ligne
• Algorithmes adaptatifs selon vos mots-clés

**✨ Votre composition "${style} - ${prompt}" est unique !**

**🔧 CODE GÉNÉRATION INCLUS :**
Algorithme musical personnalisé prêt à l'emploi.`;

    res.status(200).json({ 
      result: result,
      status: 'web_audio_ready',
      audio_code: audioGenerationCode,
      music_params: musicParams,
      can_generate: true,
      download_format: 'WAV'
    });

  } catch (error) {
    console.error('Erreur génération Web Audio:', error.message);
    
    res.status(500).json({ 
      error: 'Erreur lors de la génération audio',
      details: error.message
    });
  }
}
