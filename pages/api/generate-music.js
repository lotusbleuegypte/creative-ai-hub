export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, style, duration } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'Token API Replicate manquant dans les variables d\'environnement' });
  }

  try {
    // Construire le prompt musical
    const musicPrompt = `${style} music, ${prompt}`;
    
    console.log('Génération musicale avec prompt:', musicPrompt);

    // Appel à l'API Replicate pour MusicGen
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dae",
        input: {
          model_version: "stereo-large",
          prompt: musicPrompt,
          duration: duration || 30,
          temperature: 0.8,
          top_k: 250,
          top_p: 0.0,
          classifier_free_guidance: 3.0,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Replicate API Error: ${error.detail || 'Erreur inconnue'}`);
    }

    const prediction = await response.json();

    // Attendre que la génération soit terminée
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 secondes
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });

      if (statusResponse.ok) {
        result = await statusResponse.json();
      }
      attempts++;
    }

    if (result.status === 'failed') {
      throw new Error(`Génération échouée: ${result.error || 'Erreur inconnue'}`);
    }

    if (result.status !== 'succeeded') {
      throw new Error('Timeout: La génération prend trop de temps');
    }

    // Formatage du résultat
    const musicResult = `🎵 **Composition générée avec succès !**

**🎼 Détails de la composition :**
• **Style :** ${style}
• **Inspiration :** ${prompt}
• **Durée :** ${duration || 30} secondes
• **Modèle :** MusicGen Stereo Large
• **Qualité :** HD Stéréo

**🎧 Votre musique est prête !**
${result.output ? `🔗 **Lien de téléchargement :** ${result.output}` : ''}

**💡 Conseils :**
• Écoutez avec un bon casque pour apprécier la qualité stéréo
• Vous pouvez utiliser cette musique dans vos projets créatifs
• Essayez différents styles pour des ambiances variées !`;

    res.status(200).json({ 
      result: musicResult,
      audio_url: result.output,
      metadata: {
        style,
        prompt,
        duration: duration || 30,
        model: 'MusicGen Stereo Large'
      }
    });

  } catch (error) {
    console.error('Erreur génération musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération musicale',
      details: error.message
    });
  }
}
