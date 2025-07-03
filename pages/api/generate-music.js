// pages/api/generate-music.js - VERSION HUGGING FACE + MÉTADONNÉES

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, duration, token } = req.body;

    if (!prompt || !style) {
      return res.status(400).json({ error: 'Prompt et style requis' });
    }

    if (!token) {
      return res.status(400).json({ error: 'Token Hugging Face requis' });
    }

    // Génération des métadonnées comme avant
    const musicData = generateAdvancedMusicData(prompt, style, duration);

    // Création du prompt optimisé pour Hugging Face
    const optimizedPrompt = createOptimizedPrompt(prompt, style, musicData);

    // 🎵 VRAIE GÉNÉRATION MUSICALE avec Hugging Face
    let audioBase64 = null;
    try {
      console.log('🎵 Génération audio avec Hugging Face...');
      
     const response = await fetch('https://api-inference.huggingface.co/models/facebook/musicgen-stereo-large', {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: optimizedPrompt,
          parameters: {
            max_new_tokens: Math.min(1024, duration * 8),
            temperature: 0.7,
            do_sample: true,
          }
        })
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        audioBase64 = Buffer.from(audioBuffer).toString('base64');
        console.log('✅ Audio généré avec succès !');
      } else {
        console.log('⚠️ Fallback vers simulation (modèle en chargement)');
      }

    } catch (error) {
      console.log('⚠️ Erreur Hugging Face, fallback vers simulation:', error.message);
    }

    // Texte de résultat enrichi
    const result = `🎵 Composition générée avec ${audioBase64 ? 'HUGGING FACE' : 'SIMULATION'} !\n\n📋 Votre composition "${style}" :\n• Ambiance : ${prompt}\n• Durée : ${duration} secondes\n• Qualité : ${audioBase64 ? 'Professionnelle (Vraie IA)' : 'Simulation Premium'}\n\n🎼 Structure musicale :\n${musicData.structure}\n\n🎹 Instruments générés :\n${musicData.instruments.map(i => `• ${i}`).join('\n')}\n\n🎵 Caractéristiques :\n• Tempo : ${musicData.bpm} BPM\n• Tonalité : ${musicData.key}\n• Style : ${musicData.description}\n• Complexité : ${musicData.complexity}/5\n• Ambiance : ${musicData.mood}\n\n${audioBase64 ? '🎧 AUDIO RÉEL GÉNÉRÉ par IA !' : '🎧 Simulation audio prête !'}`;

    res.status(200).json({
      success: true,
      result: result,
      audioData: musicData,
      audioBase64: audioBase64,
      webAudioReady: true,
      realAudio: !!audioBase64,
      optimizedPrompt: optimizedPrompt
    });

  } catch (error) {
    console.error('Erreur génération musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération musicale',
      details: error.message
    });
  }
}

function createOptimizedPrompt(prompt, style, musicData) {
  const stylePrompts = {
    electronic: `electronic dance music, synthesizers, ${musicData.bpm} bpm`,
    pop: `pop music, catchy melody, vocals, modern production`,
    rock: `rock music, electric guitar, drums, energetic`,
    jazz: `jazz music, saxophone, piano, improvisation, swing`,
    classical: `classical music, orchestra, strings, piano`,
    ambient: `ambient music, atmospheric, drone, peaceful`
  };

  const baseStyle = stylePrompts[style] || stylePrompts.electronic;
  let optimized = `${baseStyle}, ${prompt}`;

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
