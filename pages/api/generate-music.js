export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, style, duration } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  // Debug: vérifier toutes les variables d'environnement disponibles
  console.log('Variables disponibles:', Object.keys(process.env).filter(key => key.includes('REPLICATE')));
  console.log('REPLICATE_API_TOKEN exists:', !!process.env.REPLICATE_API_TOKEN);

  const apiToken = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN || process.env.replicate_api_token;

  if (!apiToken) {
    return res.status(500).json({ 
      error: 'Token API Replicate manquant',
      debug: 'Variables disponibles: ' + Object.keys(process.env).filter(key => key.toLowerCase().includes('replicate')).join(', ')
    });
  }

  try {
    const musicPrompt = `${style} music, ${prompt}`;
    
    console.log('Génération musicale avec prompt:', musicPrompt);
    console.log('Token utilisé:', apiToken.substring(0, 10) + '...');

    // Première tentative : créer la prédiction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
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
      const errorText = await respo
