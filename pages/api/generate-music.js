// pages/api/generate-music.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, duration, bpm, key } = req.body;

    // Validation des paramètres
    if (!prompt || !style) {
      return res.status(400).json({ error: 'Prompt et style requis' });
    }

    // Simulation d'une génération musicale réaliste
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simule le temps de traitement

    // Génération de métadonnées musicales
    const musicMetadata = generateMusicMetadata(prompt, style, duration, bpm, key);

    // Réponse avec les données de la composition
    res.status(200).json({
      success: true,
      result: `🎵 Composition générée avec succès!

📋 Détails de votre composition :
• Style: ${style.charAt(0).toUpperCase() + style.slice(1)}
• Ambiance: ${prompt}
• Tempo: ${bpm} BPM
• Tonalité: ${key}
• Durée: ${duration} secondes

🎼 Caractéristiques musicales :
${musicMetadata.description}

🎹 Instruments générés :
${musicMetadata.instruments.join(', ')}

✨ Votre composition est prête à être jouée !

🎵 Web Audio Prêt - Cliquez sur "Jouer" pour écouter votre création musicale.`,
      metadata: musicMetadata,
      audioReady: true
    });

  } catch (error) {
    console.error('Erreur génération musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération musicale',
      details: error.message 
    });
  }
}

function generateMusicMetadata(prompt, style, duration, bpm, key) {
  // Configuration basée sur le style
  const styleConfigs = {
    electronic: {
      description: "Synthétiseurs modernes, basses profondes, rythmes électroniques complexes",
      instruments: ["Lead Synth", "Bass Synth", "Arp Synth", "Electronic Drums", "Pad"]
    },
    pop: {
      description: "Mélodie accrocheuse, harmonies riches, structure verse-chorus",
      instruments: ["Lead Vocal", "Piano", "Guitare", "Basse", "Batterie", "Strings"]
    },
    rock: {
      description: "Guitares puissantes, rythmes énergiques, solos expressifs",
      instruments: ["Guitare Lead", "Guitare Rythmique", "Basse", "Batterie", "Voix"]
    },
    jazz: {
      description: "Harmonies sophistiquées, improvisation, swing rythmique",
      instruments: ["Piano Jazz", "Contrebasse", "Batterie Jazz", "Cuivres", "Saxophone"]
    },
    classical: {
      description: "Orchestration riche, développements thématiques, dynamiques variées",
      instruments: ["Violons", "Alto", "Violoncelle", "Contrebasse", "Piano", "Bois"]
    },
    ambient: {
      description: "Textures atmosphériques, évolution lente, spatialisation sonore",
      instruments: ["Pad Ambient", "Reverb Synth", "Field Recording", "Drone Bass"]
    }
  };

  const config = styleConfigs[style] || styleConfigs.electronic;

  // Génération d'une structure musicale basée sur les paramètres
  const structure = generateMusicStructure(duration, bpm, style);

  return {
    style,
    prompt,
    bpm: parseInt(bpm),
    key,
    duration: parseInt(duration),
    description: config.description,
    instruments: config.instruments,
    structure,
    complexity: calculateComplexity(style, bpm, prompt),
    mood: analyzeMood(prompt),
    generatedAt: new Date().toISOString(),
    version: "2.0"
  };
}

function generateMusicStructure(duration, bpm, style) {
  const sections = [];
  const totalBars = Math.floor((duration * bpm) / 240); // Estimation des mesures

  // Structure basée sur le style
  if (style === 'pop' || style === 'rock') {
    sections.push(
      { name: "Intro", bars: Math.min(4, totalBars * 0.1) },
      { name: "Verse", bars: Math.min(8, totalBars * 0.3) },
      { name: "Chorus", bars: Math.min(8, totalBars * 0.3) },
      { name: "Bridge", bars: Math.min(4, totalBars * 0.2) },
      { name: "Outro", bars: Math.min(4, totalBars * 0.1) }
    );
  } else if (style === 'electronic') {
    sections.push(
      { name: "Build-up", bars: Math.min(8, totalBars * 0.2) },
      { name: "Drop", bars: Math.min(16, totalBars * 0.4) },
      { name: "Breakdown", bars: Math.min(8, totalBars * 0.2) },
      { name: "Final Drop", bars: Math.min(8, totalBars * 0.2) }
    );
  } else {
    sections.push(
      { name: "Exposition", bars: Math.floor(totalBars * 0.4) },
      { name: "Développement", bars: Math.floor(totalBars * 0.4) },
      { name: "Conclusion", bars: Math.floor(totalBars * 0.2) }
    );
  }

  return sections;
}

function calculateComplexity(style, bpm, prompt) {
  let complexity = 1;
  
  // Facteur style
  const styleComplexity = {
    'classical': 3,
    'jazz': 3,
    'rock': 2,
    'electronic': 2,
    'pop': 1,
    'ambient': 1
  };
  
  complexity *= (styleComplexity[style] || 1);
  
  // Facteur tempo
  if (bpm > 140) complexity += 0.5;
  if (bpm < 80) complexity += 0.3;
  
  // Facteur description
  const complexWords = ['complex', 'sophistiqué', 'avancé', 'technique', 'virtuose'];
  if (complexWords.some(word => prompt.toLowerCase().includes(word))) {
    complexity += 0.5;
  }
  
  return Math.min(5, Math.max(1, complexity));
}

function analyzeMood(prompt) {
  const moodKeywords = {
    'joyeux': ['joyeux', 'heureux', 'énergique', 'festif', 'optimiste'],
    'mélancolique': ['triste', 'mélancolique', 'nostalgique', 'sombre'],
    'mystérieux': ['mystérieux', 'énigmatique', 'intriguant', 'dark'],
    'romantique': ['romantique', 'doux', 'tendre', 'amoureux'],
    'énergique': ['énergique', 'puissant', 'dynamique', 'intense'],
    'relaxant': ['calme', 'relaxant', 'paisible', 'zen', 'tranquille']
  };

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
      return mood;
    }
  }

  return 'neutre';
}
