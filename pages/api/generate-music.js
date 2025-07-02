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
    
    console.log('=== DEBUG REPLICATE ===');
    console.log('Prompt:', musicPrompt);
    console.log('Token present:', !!apiToken);
    console.log('Token preview:', apiToken.substring(0, 10) + '...');

    // Test simple d'abord : vérifier que l'API Replicate répond
    const testResponse = await fetch('https://api.replicate.com/v1/models', {
      headers: {
        'Authorization': 'Token ' + apiToken,
        'Content-Type': 'application/json',
      }
    });

    console.log('Test API Status:', testResponse.status);

    if (!testResponse.ok) {
      const testError = await testResponse.text();
      console.log('Test API Error:', testError);
      throw new Error('Token Replicate invalide. Status: ' + testResponse.status + ' - ' + testError);
    }

    console.log('Token Replicate valide !');

    // Maintenant essayer la génération musicale
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

    console.log('Prediction Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Prediction Error Response:', errorText);
      
      let errorDetails = '';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.detail || errorJson.error || errorText;
      } catch (e) {
        errorDetails = errorText;
      }
      
      throw new Error('Erreur Replicate API: ' + response.status + ' - ' + errorDetails);
    }

    const prediction = await response.json();
    console.log('Prediction creee avec succes:', prediction.id);
    console.log('Status initial:', prediction.status);

    // Version simplifiée : retourner immédiatement avec l'ID
    const quickResult = 'Generation musicale demarree avec succes !\n\n' +
      'Details de la requete:\n' +
      '• Style: ' + style + '\n' +
      '• Inspiration: ' + prompt + '\n' +
      '• Duree: ' + (duration || 30) + ' secondes\n' +
      '• Modele: MusicGen Stereo Large\n\n' +
      'Statut: ' + prediction.status + '\n' +
      'ID de prediction: ' + prediction.id + '\n\n' +
      'La generation musicale prend 2-5 minutes.\n' +
      'Vous pouvez verifier le progres sur:\n' +
      'https://replicate.com/p/' + prediction.id + '\n\n' +
      'Note: Cette fonctionnalite est en test. Replicate fonctionne correctement !';

    res.status(200).json({ 
      result: quickResult,
      status: 'started',
      prediction_id: prediction.id,
      prediction_url: 'https://replicate.com/p/' + prediction.id
    });

  } catch (error) {
    console.error('=== ERREUR COMPLETE ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Erreur lors de la generation musicale',
      details: error.message,
      debug_info: {
        has_token: !!apiToken,
        token_preview: apiToken ? apiToken.substring(0, 5) + '...' : 'none',
        error_type: error.name,
        timestamp: new Date().toISOString()
      }
    });
  }
}
