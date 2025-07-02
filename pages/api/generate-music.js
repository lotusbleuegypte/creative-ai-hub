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
    const simulatedResult = 'Test de generation musicale reussi !\n\n' +
      'Parametres recus:\n' +
      '• Style: ' + style + '\n' +
      '• Description: ' + prompt + '\n' +
      '• Duree: ' + (duration || 30) + ' secondes\n\n' +
      'Token Replicate: Present (' + apiToken.substring(0, 8) + '...)\n\n' +
      'Prochaine etape: Integration complete avec Replicate API\n' +
      'Cette version confirme que votre configuration fonctionne !';

    res.status(200).json({ 
      result: simulatedResult,
      status: 'test_success'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur de test',
      details: error.message
    });
  }
}
