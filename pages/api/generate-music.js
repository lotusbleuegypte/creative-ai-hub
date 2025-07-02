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
    // Étape 1 : Tester la connectivité de base
    console.log('=== TEST 1: Connectivite de base ===');
    
    let testResult = '';
    try {
      const testResponse = await fetch('https://httpbin.org/status/200');
      testResult = 'Internet: OK (' + testResponse.status + ')';
    } catch (e) {
      testResult = 'Internet: ERREUR - ' + e.message;
    }

    // Étape 2 : Tester l'accès à Replicate
    console.log('=== TEST 2: Acces Replicate ===');
    
    let replicateTest = '';
    try {
      const replicateResponse = await fetch('https://api.replicate.com/v1/models', {
        headers: {
          'Authorization': 'Token ' + apiToken,
        }
      });
      replicateTest = 'Replicate API: ' + replicateResponse.status;
      if (!replicateResponse.ok) {
        const errorBody = await replicateResponse.text();
        replicateTest += ' - ' + errorBody.substring(0, 200);
      }
    } catch (e) {
      replicateTest = 'Replicate API: ERREUR - ' + e.message;
    }

    // Étape 3 : Essayer la génération musicale
    console.log('=== TEST 3: Generation musicale ===');
    
    let generationTest = '';
    const musicPrompt = style + ' music, ' + prompt;
    
    try {
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

      generationTest = 'Generation: ' + response.status;
      
      if (response.ok) {
        const prediction = await response.json();
        generationTest += ' - SUCCESS - ID: ' + prediction.id;
        
        // SUCCÈS !
        const successResult = 'GENERATION MUSICALE REUSSIE !\n\n' +
          'Diagnostics:\n' +
          '• ' + testResult + '\n' +
          '• ' + replicateTest + '\n' +
          '• ' + generationTest + '\n\n' +
          'Votre composition:\n' +
          '• Style: ' + style + '\n' +
          '• Description: ' + prompt + '\n' +
          '• Duree: ' + (duration || 30) + ' secondes\n\n' +
          'ID de prediction: ' + prediction.id + '\n' +
          'Statut: ' + prediction.status + '\n\n' +
          'Suivez le progres:\n' +
          'https://replicate.com/p/' + prediction.id;

        return res.status(200).json({ 
          result: successResult,
          prediction_id: prediction.id,
          status: 'success'
        });
        
      } else {
        const errorBody = await response.text();
        generationTest += ' - ERREUR: ' + errorBody.substring(0, 300);
      }
      
    } catch (e) {
      generationTest = 'Generation: ERREUR CRITIQUE - ' + e.message + ' - Stack: ' + (e.stack || '').substring(0, 200);
    }

    // Retourner le diagnostic complet
    const diagnosticResult = 'DIAGNOSTIC COMPLET DE L\'ERREUR\n\n' +
      'Tests effectues:\n' +
      '• ' + testResult + '\n' +
      '• ' + replicateTest + '\n' +
      '• ' + generationTest + '\n\n' +
      'Parametres recus:\n' +
      '• Style: ' + style + '\n' +
      '• Description: ' + prompt + '\n' +
      '• Duree: ' + (duration || 30) + '\n' +
      '• Token present: ' + (apiToken ? 'OUI (' + apiToken.substring(0, 8) + '...)' : 'NON') + '\n\n' +
      'Heure du test: ' + new Date().toISOString() + '\n\n' +
      'PROCHAINE ETAPE: Analysez ces resultats pour identifier le probleme exact.';

    res.status(500).json({ 
      result: diagnosticResult,
      debug: true
    });

  } catch (mainError) {
    console.error('ERREUR PRINCIPALE:', mainError);
    
    const errorResult = 'ERREUR CRITIQUE DETECTEE\n\n' +
      'Type: ' + mainError.name + '\n' +
      'Message: ' + mainError.message + '\n' +
      'Stack: ' + (mainError.stack || '').substring(0, 300) + '\n\n' +
      'Heure: ' + new Date().toISOString() + '\n\n' +
      'Cette erreur nous aide a identifier le probleme !';

    res.status(500).json({ 
      result: errorResult,
      error_details: {
        name: mainError.name,
        message: mainError.message,
        stack: mainError.stack
      }
    });
  }
}
