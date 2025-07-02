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
    
    console.log('Demarrage generation musicale:', musicPrompt);

    // Créer la prédiction Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dae",
        input: {
          model_version: "stereo-large",
          prompt: musicPrompt,
          duration: parseInt(duration) || 30,
          temperature: 0.8,
          top_k: 250,
          top_p: 0.0,
          classifier_free_guidance: 3.0,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Replicate:', response.status, errorText);
      
      // Message d'erreur plus user-friendly
      let userError = 'Erreur de l\'API de generation musicale';
      if (response.status === 401) {
        userError = 'Token Replicate invalide ou expire';
      } else if (response.status === 402) {
        userError = 'Credit Replicate insuffisant';
      } else if (response.status === 429) {
        userError = 'Trop de requetes, reessayez dans quelques minutes';
      }
      
      throw new Error(userError + ' (Status: ' + response.status + ')');
    }

    const prediction = await response.json();
    console.log('Prediction creee:', prediction.id);

    // Version asynchrone : on retourne immédiatement avec l'ID
    const asyncResult = 'Generation musicale demarree avec succes !\n\n' +
      'Votre composition est en cours de creation:\n\n' +
      '🎼 Parametres:\n' +
      '• Style: ' + style + '\n' +
      '• Description: ' + prompt + '\n' +
      '• Duree: ' + (duration || 30) + ' secondes\n' +
      '• Modele: MusicGen Stereo Large\n\n' +
      '⏱️ Temps estime: 2-5 minutes\n' +
      '🆔 ID de prediction: ' + prediction.id + '\n\n' +
      '🔗 Suivez le progres en temps reel:\n' +
      'https://replicate.com/p/' + prediction.id + '\n\n' +
      '✨ Votre musique sera disponible au telechargement une fois terminee !\n\n' +
      '💡 Astuce: Gardez cette page ouverte ou notez l\'ID pour recuperer votre creation plus tard.';

    res.status(200).json({ 
      result: asyncResult,
      status: 'processing',
      prediction_id: prediction.id,
      prediction_url: 'https://replicate.com/p/' + prediction.id,
      estimated_time: '2-5 minutes'
    });

  } catch (error) {
    console.error('Erreur generation musicale:', error.message);
    
    res.status(500).json({ 
      error: 'Erreur lors de la generation musicale',
      details: error.message,
      suggestion: 'Verifiez votre credit Replicate ou reessayez dans quelques minutes'
    });
  }
}
