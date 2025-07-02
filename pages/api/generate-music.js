export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, style, duration } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    return res.status(500).json({ 
      error: 'Token API Replicate manquant'
    });
  }

  try {
    const musicPrompt = style + ' music, ' + prompt;
    
    console.log('Generation musicale avec prompt:', musicPrompt);

    // Utilisation de la version correcte et actuelle de MusicGen
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Version MusicGen mise à jour
        version: "7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906",
        input: {
          prompt: musicPrompt,
          model_version: "melody", // Version plus stable
          duration: parseInt(duration) || 30,
          temperature: 0.8,
          top_k: 250,
          top_p: 0.0,
        }
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Replicate:', response.status, errorText);
      
      // Messages d'erreur plus clairs
      let userMessage = 'Erreur de generation musicale';
      if (response.status === 422) {
        userMessage = 'Probleme avec les parametres de generation. Essayez avec une description plus simple.';
      } else if (response.status === 401) {
        userMessage = 'Token Replicate invalide. Verifiez votre configuration.';
      } else if (response.status === 402) {
        userMessage = 'Credit Replicate insuffisant. Rechargez votre compte.';
      } else if (response.status === 429) {
        userMessage = 'Trop de requetes. Attendez quelques minutes avant de reessayer.';
      }
      
      throw new Error(userMessage + ' (Status: ' + response.status + ')');
    }

    const prediction = await response.json();
    console.log('Prediction creee avec succes:', prediction.id);

    // Retour immédiat avec l'ID de prédiction
    const result = 'Generation musicale demarree avec succes !\n\n' +
      'Votre composition personnalisee:\n\n' +
      '🎼 Parametres:\n' +
      '• Style: ' + style + '\n' +
      '• Description: ' + prompt + '\n' +
      '• Duree: ' + (duration || 30) + ' secondes\n' +
      '• Modele: MusicGen Melody\n\n' +
      '⏱️ Temps estime: 2-4 minutes\n' +
      '🆔 ID de prediction: ' + prediction.id + '\n\n' +
      '🔗 Suivez le progres en temps reel:\n' +
      'https://replicate.com/p/' + prediction.id + '\n\n' +
      '✨ Votre musique sera prete sous peu !\n\n' +
      '💡 Conseil: Sauvegardez ce lien pour recuperer votre creation.\n' +
      '🎧 Une fois termine, vous pourrez telecharger le fichier audio !';

    res.status(200).json({ 
      result: result,
      status: 'processing',
      prediction_id: prediction.id,
      prediction_url: 'https://replicate.com/p/' + prediction.id,
      estimated_completion: new Date(Date.now() + 4 * 60 * 1000).toISOString() // +4 minutes
    });

  } catch (error) {
    console.error('Erreur generation musicale:', error.message);
    
    res.status(500).json({ 
      error: 'Erreur lors de la generation musicale',
      details: error.message,
      suggestion: 'Essayez avec une description plus simple ou attendez quelques minutes'
    });
  }
}
