// pages/api/generate-music.js - VERSION SUNO API RÉELLE !!!

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, duration } = req.body;

    if (!prompt || !style) {
      return res.status(400).json({ error: 'Prompt et style requis' });
    }

    // Génération des métadonnées
    const musicData = generateAdvancedMusicData(prompt, style, duration);

    // 🎵 VRAIE GÉNÉRATION AVEC SUNO API !
    let audioUrl = null;
    let realAudio = false;
    let method = 'Simulation';
    
    try {
      console.log('🎵 Génération avec VRAIE API SUNO...');
      
      // Option 1: MusicHero (GRATUIT sans compte)
      const musicHeroResult = await generateWithMusicHero(prompt, style, duration);
      if (musicHeroResult.success) {
        audioUrl = musicHeroResult.audioUrl;
        realAudio = true;
        method = 'Suno AI via MusicHero';
        console.log('✅ MusicHero Suno API fonctionne !');
      }
      
      // Option 2: PiAPI (Payant mais fiable)
      if (!realAudio) {
        const piApiResult = await generateWithPiAPI(prompt, style, duration);
        if (piApiResult.success) {
          audioUrl = piApiResult.audioUrl;
          realAudio = true;
          method = 'Suno AI via PiAPI';
          console.log('✅ PiAPI Suno fonctionne !');
        }
      }
      
      // Option 3: SunoAPI.org (Alternative)
      if (!realAudio) {
        const sunoOrgResult = await generateWithSunoOrg(prompt, style, duration);
        if (sunoOrgResult.success) {
          audioUrl = sunoOrgResult.audioUrl;
          realAudio = true;
          method = 'Suno AI via SunoAPI.org';
          console.log('✅ SunoAPI.org fonctionne !');
        }
      }

    } catch (error) {
      console.log('⚠️ Toutes les APIs Suno indisponibles:', error.message);
    }

    // Texte de résultat
    const result = `🎵 Composition générée avec ${realAudio ? method.toUpperCase() : 'SIMULATION AVANCÉE'} !

📋 Votre composition "${style}" :
• Ambiance : ${prompt}
• Durée : ${duration} secondes
• Qualité : ${realAudio ? 'SUNO AI - Radio Quality' : 'Simulation Premium'}

🎼 Structure musicale :
${musicData.structure}

🎹 Instruments générés :
${musicData.instruments.map(i => `• ${i}`).join('\n')}

🎵 Caractéristiques :
• Tempo : ${musicData.bpm} BPM
• Tonalité : ${musicData.key}
• Style : ${musicData.description}
• Complexité : ${musicData.complexity}/5
• Ambiance : ${musicData.mood}

${realAudio ? '🎧 VRAIE MUSIQUE SUNO AI générée !' : '🎧 Simulation audio'}

${realAudio ? `🔗 Généré par: ${method}` : '💡 APIs Suno temporairement indisponibles'}`;

    res.status(200).json({
      success: true,
      result: result,
      audioData: musicData,
      audioUrl: audioUrl,
      webAudioReady: true,
      realAudio: realAudio,
      method: method,
      sunoQuality: realAudio
    });

  } catch (error) {
    console.error('Erreur génération musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération musicale',
      details: error.message
    });
  }
}

// 🎵 OPTION 1: MusicHero (GRATUIT - pas de compte requis)
async function generateWithMusicHero(prompt, style, duration) {
  try {
    // Construire le prompt optimisé pour Suno
    const sunoPrompt = buildSunoPrompt(prompt, style);
    
    const response = await fetch('https://musichero.ai/api/suno/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MusicApp/1.0)'
      },
      body: JSON.stringify({
        prompt: sunoPrompt,
        make_instrumental: style !== 'pop', // Instrumental sauf pour pop
        duration: Math.min(duration, 120), // Max 2 minutes
        model_version: 'v3.5' // Dernière version Suno
      }),
      timeout: 30000
    });

    if (response.ok) {
      const data = await response.json();
      
      // MusicHero retourne généralement l'URL directement
      if (data.audio_url || data.url || data.download_url) {
        return {
          success: true,
          audioUrl: data.audio_url || data.url || data.download_url
        };
      }
      
      // Si c'est asynchrone, attendre le résultat
      if (data.task_id || data.id) {
        const finalUrl = await waitForMusicHeroResult(data.task_id || data.id);
        if (finalUrl) {
          return { success: true, audioUrl: finalUrl };
        }
      }
    }
  } catch (error) {
    console.log('MusicHero error:', error.message);
  }
  
  return { success: false };
}

// 🎵 OPTION 2: PiAPI (Payant mais très fiable)
async function generateWithPiAPI(prompt, style, duration) {
  try {
    const sunoPrompt = buildSunoPrompt(prompt, style);
    
    // Vous devez vous inscrire sur piapi.ai pour avoir une clé
    const PIAPI_KEY = process.env.PIAPI_KEY || 'demo-key';
    
    const response = await fetch('https://api.piapi.ai/api/suno/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PIAPI_KEY}`
      },
      body: JSON.stringify({
        prompt: sunoPrompt,
        make_instrumental: style !== 'pop',
        duration: Math.min(duration, 120),
        model: 'v3.5'
      }),
      timeout: 35000
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        // PiAPI retourne souvent un tableau avec 2 variantes
        const track = data.data[0];
        if (track.audio_url) {
          return {
            success: true,
            audioUrl: track.audio_url
          };
        }
      }
    }
  } catch (error) {
    console.log('PiAPI error:', error.message);
  }
  
  return { success: false };
}

// 🎵 OPTION 3: SunoAPI.org (Alternative)
async function generateWithSunoOrg(prompt, style, duration) {
  try {
    const sunoPrompt = buildSunoPrompt(prompt, style);
    
    const response = await fetch('https://api.sunoapi.org/v1/music/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: sunoPrompt,
        instrumental: style !== 'pop',
        duration: Math.min(duration, 60) // Limité en gratuit
      }),
      timeout: 25000
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.music_url) {
        return {
          success: true,
          audioUrl: data.music_url
        };
      }
    }
  } catch (error) {
    console.log('SunoAPI.org error:', error.message);
  }
  
  return { success: false };
}

// Construire un prompt optimisé pour Suno
function buildSunoPrompt(prompt, style) {
  const styleDescriptions = {
    electronic: 'electronic synthwave dark atmospheric 80s retro',
    pop: 'catchy pop melody upbeat radio-friendly',
    rock: 'powerful rock guitar-driven energetic',
    jazz: 'smooth jazz sophisticated piano saxophone',
    classical: 'orchestral classical strings emotional',
    ambient: 'ambient atmospheric peaceful meditation'
  };
  
  const styleDesc = styleDescriptions[style] || styleDescriptions.electronic;
  
  // Format optimisé pour Suno
  return `${styleDesc}, ${prompt}`.toLowerCase();
}

// Attendre le résultat de MusicHero (si asynchrone)
async function waitForMusicHeroResult(taskId, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Attendre 3s
    
    try {
      const response = await fetch(`https://musichero.ai/api/suno/status/${taskId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'completed' && data.audio_url) {
          return data.audio_url;
        }
        
        if (data.status === 'failed') {
          break;
        }
      }
    } catch (error) {
      console.log(`Tentative ${attempt + 1} échouée`);
    }
  }
  
  return null;
}

// Garder vos fonctions existantes...
function generateAdvancedMusicData(prompt, style, duration) {
  const styles = {
    electronic: {
      description: "Synthétiseurs modernes, basses profondes, rythmes électroniques complexes",
      instruments: ["Lead Synth", "Bass Synth", "Arp Synth", "Electronic Drums", "Pad Ambient"],
      bpm: 128,
      key: "Am",
      structure: "Intro (8s) → Build-up (16s) → Drop (20s) → Breakdown (12s) → Final Drop (14s)"
    },
    pop: {
      description: "Mélodie accrocheuse, harmonies riches, structure verse-chorus",
      instruments: ["Piano", "Guitare Acoustique", "Basse", "Batterie", "Cordes", "Voix Lead"],
      bpm: 120,
      key: "C",
      structure: "Intro (4s) → Verse (16s) → Chorus (16s) → Verse (12s) → Outro (8s)"
    },
    rock: {
      description: "Guitares puissantes, rythmes énergiques, solos expressifs",
      instruments: ["Guitare Lead", "Guitare Rythmique", "Basse Électrique", "Batterie Rock", "Voix"],
      bpm: 140,
      key: "E",
      structure: "Intro (6s) → Verse (18s) → Chorus (16s) → Solo (12s) → Final Chorus (18s)"
    },
    jazz: {
      description: "Harmonies sophistiquées, improvisation, swing rythmique",
      instruments: ["Piano Jazz", "Contrebasse", "Batterie Jazz", "Saxophone", "Trompette"],
      bpm: 90,
      key: "Bb",
      structure: "Theme (20s) → Piano Solo (20s) → Sax Solo (16s) → Trading 4s (14s)"
    },
    classical: {
      description: "Orchestration riche, développements thématiques, dynamiques variées",
      instruments: ["Violons I", "Violons II", "Alto", "Violoncelle", "Contrebasse", "Piano"],
      bpm: 80,
      key: "Dm",
      structure: "Exposition (24s) → Développement (28s) → Récapitulation (18s)"
    },
    ambient: {
      description: "Textures atmosphériques, évolution lente, spatialisation sonore",
      instruments: ["Pad Ambient", "Reverb Synth", "Field Recording", "Drone Bass", "Cristaux"],
      bpm: 60,
      key: "F#",
      structure: "Émergence (20s) → Évolution (40s) → Apogée (15s) → Dissolution (15s)"
    }
  };

  const config = styles[style] || styles.electronic;
  
  if (prompt.includes('fast') || prompt.includes('énergique')) {
    config.bpm += 20;
  }
  if (prompt.includes('slow') || prompt.includes('calme')) {
    config.bpm -= 15;
  }

  return {
    ...config,
    prompt,
    style,
    duration: parseInt(duration),
    complexity: calculateComplexity(style, prompt),
    mood: analyzeMood(prompt),
    generatedAt: new Date().toISOString()
  };
}

function calculateComplexity(style, prompt) {
  let complexity = 1;
  
  const styleComplexity = {
    'classical': 3,
    'jazz': 3,
    'rock': 2,
    'electronic': 2,
    'pop': 1,
    'ambient': 1
  };
  
  complexity *= (styleComplexity[style] || 1);
  
  const complexWords = ['complex', 'sophistiqué', 'avancé', 'technique', 'virtuose'];
  if (complexWords.some(word => prompt.toLowerCase().includes(word))) {
    complexity += 0.5;
  }
  
  return Math.min(5, Math.max(1, complexity));
}

function analyzeMood(prompt) {
  const moodKeywords = {
    'joyeux': ['joyeux', 'heureux', 'énergique', 'festif', 'optimiste', 'upbeat'],
    'mélancolique': ['triste', 'mélancolique', 'nostalgique', 'sombre', 'sad'],
    'mystérieux': ['mystérieux', 'énigmatique', 'intriguant', 'dark', 'mysterious'],
    'romantique': ['romantique', 'doux', 'tendre', 'amoureux', 'romantic'],
    'énergique': ['énergique', 'puissant', 'dynamique', 'intense', 'powerful'],
    'relaxant': ['calme', 'relaxant', 'paisible', 'zen', 'tranquille', 'chill']
  };

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
      return mood;
    }
  }

  return 'neutre';
}
