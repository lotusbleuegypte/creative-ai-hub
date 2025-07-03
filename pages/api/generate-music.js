// pages/api/generate-music.js - VERSION WEB AUDIO ILLIMITÉE

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, duration } = req.body;

    if (!prompt || !style) {
      return res.status(400).json({ error: 'Prompt et style requis' });
    }

    // Simulation du temps de génération (comme Suno)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Génération de métadonnées musicales avancées
    const musicData = generateAdvancedMusicData(prompt, style, duration);

    const result = `🎵 Composition générée avec succès !

📋 Votre composition "${style}" :
• Ambiance : ${prompt}
• Durée : ${duration} secondes
• Qualité : Professionnelle

🎼 Structure musicale :
${musicData.structure}

🎹 Instruments générés :
${musicData.instruments.join(' • ')}

🎵 Caractéristiques :
• Tempo : ${musicData.bpm} BPM
• Tonalité : ${musicData.key}
• Style : ${musicData.description}

✨ AUDIO PRÊT ! Utilisez les contrôles de lecture ci-dessous.

🎧 Votre musique de qualité Suno est maintenant disponible !`;

    res.status(200).json({
      success: true,
      result: result,
      audioData: musicData,
      webAudioReady: true
    });

  } catch (error) {
    console.error('Erreur génération musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération musicale'
    });
  }
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
