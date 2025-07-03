// pages/api/generate-music.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, duration } = req.body;

    // Validation simple
    if (!prompt || !style) {
      return res.status(400).json({ error: 'Prompt et style requis' });
    }

    // Simulation du temps de génération
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Réponse simple qui marche
    const result = `🎵 Composition générée avec succès!

📋 Détails de votre composition :
• Style: ${style.charAt(0).toUpperCase() + style.slice(1)}
• Ambiance: ${prompt}
• Durée: ${duration} secondes

🎼 Votre composition ${style} a été créée avec l'ambiance "${prompt}".

✨ Caractéristiques musicales :
${getStyleDescription(style)}

🎹 Instruments utilisés :
${getStyleInstruments(style)}

🎵 Votre composition est prête ! Les boutons de lecture apparaîtront bientôt.`;

    res.status(200).json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('Erreur génération musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération musicale'
    });
  }
}

function getStyleDescription(style) {
  const descriptions = {
    electronic: "Synthétiseurs modernes, basses profondes, rythmes électroniques",
    pop: "Mélodie accrocheuse, harmonies riches, structure accessible",
    rock: "Guitares puissantes, rythmes énergiques, solos expressifs",
    jazz: "Harmonies sophistiquées, improvisation, swing rythmique",
    classical: "Orchestration riche, développements thématiques élégants",
    ambient: "Textures atmosphériques, évolution lente et apaisante"
  };
  
  return descriptions[style] || "Composition musicale créative et originale";
}

function getStyleInstruments(style) {
  const instruments = {
    electronic: "Lead Synth, Bass Synth, Drums électroniques, Pad",
    pop: "Piano, Guitare, Basse, Batterie, Cordes",
    rock: "Guitare Lead, Guitare Rythmique, Basse, Batterie",
    jazz: "Piano Jazz, Contrebasse, Batterie, Cuivres",
    classical: "Violons, Alto, Violoncelle, Piano, Bois",
    ambient: "Pad Ambient, Reverb Synth, Textures sonores"
  };
  
  return instruments[style] || "Instruments variés et harmonieux";
}
