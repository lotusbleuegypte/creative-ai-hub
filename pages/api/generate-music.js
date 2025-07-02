export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, style, duration } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  console.log('Variables disponibles:', Object.keys(process.env).filter(key => key.includes('REPLICATE')));
  console.log('REPLICATE_API_TOKEN exists:', !!process.env.REPLICATE_API_TOKEN);

  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    return res.status(500).json({ 
      error: 'Token API Replicate manquant',
      debug: 'Variables disponibles: ' + Object.keys(process.env).filter(key => key.toLowerCase().includes('replicate')).join(', ')
    });
  }

  try {
    const musicPrompt = style + ' music, ' + prompt;
    
    console.log('Generation musicale avec prompt:', musicPrompt);

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
      throw new Error('Replicate API Error ' + response.status + ': ' + errorText);
    }

    const prediction = await response.json();
    console.log('Prediction creee:', prediction.id);

    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30;

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch('https://api.replicate.com/v1/predictions/' + result.id, {
        headers: {
          'Authorization': 'Token ' + apiToken,
        }
      });

      if (statusResponse.ok) {
        result = await statusResponse.json();
        console.log('Tentative ' + (attempts + 1) + ': Status = ' + result.status);
      }
      attempts++;
    }

    if (result.status === 'failed') {
      throw new Error('Generation echouee: ' + (result.error || 'Erreur inconnue'));
    }

    if (result.status !== 'succeeded') {
      const partialResult = 'Generation en cours...\n\n' +
        'Votre composition est en train d\'etre creee:\n' +
        '• Style: ' + style + '\n' +
        '• Inspiration: ' + prompt + '\n' +
        '• Duree: ' + (duration || 30) + ' secondes\n\n' +
        'Statut: Traitement en cours (' + result.status + ')\n' +
        'ID de prediction: ' + result.id + '\n\n' +
        'La generation musicale peut prendre jusqu\'a 5 minutes. Reessayez dans quelques instants !';

      return res.status(200).json({ 
        result: partialResult,
        status: 'processing',
        prediction_id: result.id
      });
    }

    const musicResult = 'Composition generee avec succes !\n\n' +
      'Details de la composition:\n' +
      '• Style: ' + style + '\n' +
      '• Inspiration: ' + prompt + '\n' +
      '• Duree: ' + (duration || 30) + ' secondes\n' +
      '• Modele: MusicGen Stereo Large\n' +
      '• Qualite: HD Stereo\n\n' +
      'Votre musique est prete !\n' +
      (result.output ? 'Lien de telechargement: ' + result.output + '\n\n' : '') +
      'Conseils:\n' +
      '• Ecoutez avec un bon casque pour apprecier la qualite stereo\n' +
      '• Vous pouvez utiliser cette musique dans vos projets creatifs\n' +
      '• Essayez differents styles pour des ambiances variees !\n\n' +
      'ID de prediction: ' + result.id;

    res.status(200).json({ 
      result: musicResult,
      audio_url: result.output,
      status: 'succeeded',
      metadata: {
        style: style,
        prompt: prompt,
        duration: duration || 30,
        model: 'MusicGen Stereo Large',
        prediction_id: result.id
      }
    });

  } catch (error) {
    console.error('Erreur generation musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la generation musicale',
      details: error.message,
      debug_info: {
        has_token: !!apiToken,
        token_preview: apiToken ? apiToken.substring(0, 5) + '...' : 'none'
      }
    });
  }
}
