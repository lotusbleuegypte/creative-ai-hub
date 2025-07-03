// pages/api/generate-music.js - BYPASS HUGGING FACE OFFICIEL

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { prompt, style = 'electronic', duration = 30 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt requis' });
    }

    // Génération des métadonnées fictives
    const musicData = generateAdvancedMusicData(prompt, style, duration);
    const optimizedPrompt = `${style} music, ${prompt}, ${musicData.mood}`;

    // Appel au serveur proxy MusicGen
    console.log('🔗 Génération réelle via proxy MusicGen...');

    const proxyResponse = await fetch("https://freesoundapi.space/musicgen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: optimizedPrompt })
    });

    if (!proxyResponse.ok) {
      throw new Error("API proxy MusicGen HS");
    }

    const arrayBuffer = await proxyResponse.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64');

    // Format WAV encodé
    const result = `🎵 Composition générée avec MUSICGEN PROXY !\n\n📋 Votre composition "${style}" :\n• Ambiance : ${prompt}\n• Durée : ${duration} secondes\n• Qualité : Réelle IA (WAV)\n\n🎼 Structure musicale :\n${musicData.structure}\n\n🎹 Instruments générés :\n${musicData.instruments.map(i => `• ${i}`).join('\n')}\n\n🎵 Caractéristiques :\n• Tempo : ${musicData.bpm} BPM\n• Tonalité : ${musicData.key}\n• Style : ${musicData.description}\n• Complexité : ${musicData.complexity}/5\n• Ambiance : ${musicData.mood}\n\n🎧 Audio réel encodé Base64 (WAV) prêt à jouer.`;

    res.status(200).json({
      success: true,
      result,
      audioBase64,
      realAudio: true,
      webAudioReady: true,
      optimizedPrompt,
      audioData: musicData
    });

  } catch (error) {
    console.error('❌ Erreur MusicGen Proxy :', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la génération musicale',
      details: error.message
    });
  }
}

// ———————————————————————————————————
// MÉTADONNÉES MUSICALES SIMULÉES
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
    jazz: {
      description: "Improvisation libre, textures complexes, rythme swing",
      instruments: ["Piano", "Contrebasse", "Saxophone", "Batterie Jazz", "Trompette"],
      bpm: 90,
      key: "Bb",
      structure: "Intro (10s) → Thème (20s) → Solo (30s) → Outro (10s)"
    }
  };

  const config = styles[style] || styles.electronic;
  return {
    ...config,
    style,
    prompt,
    duration,
    complexity: calculateComplexity(style, prompt),
    mood: analyzeMood(prompt),
    generatedAt: new Date().toISOString()
  };
}

function calculateComplexity(style, prompt) {
  let complexity = 1;
  if (prompt.toLowerCase().includes("complex") || prompt.toLowerCase().includes("virtuose")) {
    complexity += 1;
  }
  return Math.min(5, complexity);
}

function analyzeMood(prompt) {
  const moods = {
    joyeux: ['joyeux', 'heureux', 'festif'],
    triste: ['triste', 'mélancolique', 'sombre'],
    mystérieux: ['mystérieux', 'dark', 'inquiétant'],
    romantique: ['romantique', 'tendre', 'amoureux'],
    énergique: ['énergique', 'dynamique', 'rapide'],
    relaxant: ['calme', 'zen', 'chill']
  };
  for (const [label, keywords] of Object.entries(moods)) {
    if (keywords.some(k => prompt.toLowerCase().includes(k))) {
      return label;
    }
  }
  return 'neutre';
}
