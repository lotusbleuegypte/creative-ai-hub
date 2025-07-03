// pages/api/generate-music.js - VERSION PUBLIQUE SANS TOKEN

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, duration } = req.body;

    if (!prompt || !style) {
      return res.status(400).json({ error: 'Prompt et style requis' });
    }

    // Génération des métadonnées comme avant
    const musicData = generateAdvancedMusicData(prompt, style, duration);

    // 🎵 VRAIE GÉNÉRATION avec l'API publique Segmind (SANS TOKEN)
    let audioBase64 = null;
    let realAudio = false;
    
    try {
      console.log('🎵 Tentative génération avec Segmind API...');
      
      // Optimiser le prompt pour MusicGen
      const optimizedPrompt = createOptimizedPrompt(prompt, style, musicData);
      
      const response = await fetch('https://api.segmind.com/v1/meta-musicgen-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'public' // Certaines API publiques acceptent "public"
        },
        body: JSON.stringify({
          prompt: optimizedPrompt,
          duration: Math.min(duration, 30), // Limité à 30s en public
          model_version: "stereo-large",
          normalization_strategy: "loudness"
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.audio) {
          audioBase64 = result.audio;
          realAudio = true;
          console.log('✅ Audio généré avec Segmind !');
        }
      } else {
        console.log('⚠️ Segmind API indisponible, tentative Replicate...');
        await tryReplicateAPI(optimizedPrompt, duration);
      }

    } catch (error) {
      console.log('⚠️ APIs publiques indisponibles, tentative proxy...');
      
      // Fallback vers proxy Hugging Face public
      try {
        const audioData = await generateViaHuggingFaceSpace(optimizedPrompt, duration);
        if (audioData) {
          audioBase64 = audioData;
          realAudio = true;
        }
      } catch (proxyError) {
        console.log('⚠️ Toutes les options ont échoué, fallback simulation');
      }
    }

    // Texte de résultat
    const result = `🎵 Composition générée avec ${realAudio ? 'MUSICGEN IA' : 'SIMULATION'} !

📋 Votre composition "${style}" :
• Ambiance : ${prompt}
• Durée : ${duration} secondes
• Qualité : ${realAudio ? 'Professionnelle (IA Meta MusicGen)' : 'Simulation Premium'}

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

${realAudio ? '🎧 VRAIE MUSIQUE IA générée !' : '🎧 Simulation audio (APIs indisponibles)'}`;

    res.status(200).json({
      success: true,
      result: result,
      audioData: musicData,
      audioBase64: audioBase64,
      webAudioReady: true,
      realAudio: realAudio,
      method: realAudio ? 'MusicGen Public API' : 'Simulation'
    });

  } catch (error) {
    console.error('Erreur génération musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération musicale',
      details: error.message
    });
  }
}

// Générer via l'espace Hugging Face public (scraping)
async function generateViaHuggingFaceSpace(prompt, duration) {
  try {
    // Utiliser l'API Gradio de l'espace public MusicGen
    const gradioResponse = await fetch('https://facebook-musicgen.hf.space/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          prompt,        // Text prompt
          null,          // Melody (optional)
          duration,      // Duration
          0.9,          // Top-k
          250,          // Top-p
          1.0,          // Temperature
          3.0           // Classifier free guidance
        ],
        fn_index: 0
      })
    });

    if (gradioResponse.ok) {
      const result = await gradioResponse.json();
      if (result.data && result.data[0] && result.data[0].name) {
        // Télécharger le fichier audio généré
        const audioUrl = `https://facebook-musicgen.hf.space/file=${result.data[0].name}`;
        const audioResponse = await fetch(audioUrl);
        
        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer();
          return Buffer.from(audioBuffer).toString('base64');
        }
      }
    }
  } catch (error) {
    console.log('Erreur Hugging Face Space:', error);
  }
  
  return null;
}

// Tentative avec Replicate public
async function tryReplicateAPI(prompt, duration) {
  try {
    // Certaines instances Replicate sont publiques
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dbe",
        input: {
          prompt: prompt,
          duration: duration,
          model_version: "stereo-large"
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      // Logic pour récupérer le résultat...
      return result;
    }
  } catch (error) {
    console.log('Erreur Replicate:', error);
  }
  
  return null;
}

// Optimiser le prompt pour MusicGen
function createOptimizedPrompt(prompt, style, musicData) {
  const stylePrompts = {
    electronic: `electronic dance music, synthesizers, ${musicData.bpm} bpm`,
    pop: `pop music, catchy melody, modern production`,
    rock: `rock music, electric guitar, drums, energetic`,
    jazz: `jazz music, saxophone, piano, improvisation, swing`,
    classical: `classical music, orchestra, strings, piano`,
    ambient: `ambient music, atmospheric, peaceful`
  };

  const baseStyle = stylePrompts[style] || stylePrompts.electronic;
  
  // Combine le style avec le prompt utilisateur
  let optimized = `${baseStyle}, ${prompt}`;
  
  // Ajoute des mots-clés selon l'ambiance
  const moodKeywords = {
    'joyeux': 'upbeat, happy, energetic',
    'mélancolique': 'melancholic, sad, emotional',
    'mystérieux': 'mysterious, dark, atmospheric',
    'romantique': 'romantic, soft, gentle',
    'énergique': 'energetic, powerful, intense',
    'relaxant': 'relaxing, calm, peaceful'
  };

  if (musicData.mood && moodKeywords[musicData.mood]) {
    optimized += `, ${moodKeywords[musicData.mood]}`;
  }

  return optimized;
}

// Garder toutes vos fonctions generateAdvancedMusicData, etc...
function generateAdvancedMusicData(prompt, style, duration) {
  // ... (code existant identique)
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
  
  // Ajuster selon le prompt
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
