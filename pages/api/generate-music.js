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
    
    // Test 1: Vérifier les modèles disponibles
    console.log('=== TEST: Verification des modeles disponibles ===');
    
    let availableModels = '';
    try {
      const modelsResponse = await fetch('https://api.replicate.com/v1/models/meta/musicgen', {
        headers: {
          'Authorization': 'Token ' + apiToken,
        }
      });
      
      if (modelsResponse.ok) {
        const modelData = await modelsResponse.json();
        availableModels = 'Modele MusicGen trouve. Derniere version: ' + (modelData.latest_version ? modelData.latest_version.id : 'inconnue');
      } else {
        availableModels = 'Erreur acces modele: ' + modelsResponse.status;
      }
    } catch (e) {
      availableModels = 'Erreur verification modele: ' + e.message;
    }

    // Test 2: Essayer avec la version la plus simple possible
    console.log('=== TEST: Generation avec version simple ===');
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Essayer avec une version très basique
        version: "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
        input: {
          prompt: musicPrompt,
          duration: parseInt(duration) || 30
        }
      })
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      // Erreur détaillée
      const errorResult = 'ERREUR DETAILLEE DE REPLICATE\n\n' +
        'Status HTTP: ' + response.status + '\n' +
        'Reponse complete: ' + responseText + '\n\n' +
        'Verification modeles: ' + availableModels + '\n\n' +
        'Parametres envoyes:\n' +
        '• Prompt: ' + musicPrompt + '\n' +
        '• Duree: ' + (parseInt(duration) || 30) + '\n' +
        '• Token: ' + apiToken.substring(0, 10) + '...\n\n' +
        'Heure: ' + new Date().toISOString() + '\n\n' +
        'SOLUTIONS POSSIBLES:\n' +
        '1. Votre compte Replicate manque de credits\n' +
        '2. Le modele MusicGen n\'est plus disponible\n' +
        '3. Votre token n\'a pas les permissions necessaires\n' +
        '4. Probleme temporaire de Replicate';

      return res.status(500).json({ 
        result: errorResult,
        raw_error: responseText,
        http_status: response.status
      });
    }

    // Succès !
    const prediction = JSON.parse(responseText);
    
    const successResult = 'SUCCES ! GENERATION MUSICALE DEMARREE\n\n' +
      'Verification modeles: ' + availableModels + '\n\n' +
      'Votre composition:\n' +
      '• Style: ' + style + '\n' +
      '• Description: ' + prompt + '\n' +
      '• Duree: ' + (duration || 30) + ' secondes\n\n' +
      'ID de prediction: ' + prediction.id + '\n' +
      'Statut initial: ' + prediction.status + '\n\n' +
      'Suivez le progres:\n' +
      'https://replicate.com/p/' + prediction.id + '\n\n' +
      'Votre musique sera prete dans 2-5 minutes !';

    res.status(200).json({ 
      result: successResult,
      prediction_id: prediction.id,
      status: 'success'
    });

  } catch (mainError) {
    // Erreur JavaScript
    const jsErrorResult = 'ERREUR JAVASCRIPT DETECTEE\n\n' +
      'Type d\'erreur: ' + mainError.name + '\n' +
      'Message: ' + mainError.message + '\n' +
      'Ligne d\'erreur: ' + (mainError.stack || '').split('\n')[1] + '\n\n' +
      'Stack trace complete:\n' + (mainError.stack || '') + '\n\n' +
      'Cela nous aide a identifier le probleme exact !';

    res.status(500).json({ 
      result: jsErrorResult,
      error_type: 'javascript_error',
      error_details: {
        name: mainError.name,
        message: mainError.message,
        stack: mainError.stack
      }
    });
  }
}
