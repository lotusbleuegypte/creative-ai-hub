export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, style, duration } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  try {
    const musicPrompt = style + ' music, ' + prompt;
    
    console.log('Generation musicale gratuite avec Hugging Face:', musicPrompt);

    // Utilisation de l'API Hugging Face gratuite
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/musicgen-small', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: musicPrompt,
        parameters: {
          max_length: Math.min(parseInt(duration) || 30, 30), // Max 30s en gratuit
          temperature: 0.8,
        }
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Hugging Face:', response.status, errorText);
      
      if (response.status === 503) {
        // Modèle en cours de chargement
        const loadingResult = 'Modele de generation musicale en cours de chargement...\n\n' +
          'Le service gratuit Hugging Face demarre le modele.\n' +
          'Cela peut prendre 1-2 minutes la premiere fois.\n\n' +
          'Parametres de votre composition:\n' +
          '• Style: ' + style + '\n' +
          '• Description: ' + prompt + '\n' +
          '• Duree: ' + (duration || 30) + ' secondes\n\n' +
          'Veuillez reessayer dans 1-2 minutes !\n\n' +
          '💡 Les modeles gratuits ont parfois des temps de demarrage.';

        return res.status(200).json({ 
          result: loadingResult,
          status: 'loading',
          retry_in: '1-2 minutes'
        });
      }
      
      throw new Error('Erreur Hugging Face: ' + response.status + ' - ' + errorText);
    }

    // Vérifier si c'est du JSON ou du binaire
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const jsonResponse = await response.json();
      
      if (jsonResponse.error) {
        if (jsonResponse.error.includes('loading')) {
          const loadingResult = 'Modele en cours de chargement...\n\n' +
            'Le service gratuit demarre. Reessayez dans 1-2 minutes !\n\n' +
            'Votre composition: ' + style + ' - ' + prompt;
          
          return res.status(200).json({ 
            result: loadingResult,
            status: 'loading'
          });
        }
        throw new Error(jsonResponse.error);
      }
    }

    // Si c'est un fichier audio (réponse binaire)
    if (contentType && contentType.includes('audio')) {
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      const successResult = 'Composition musicale generee avec succes !\n\n' +
        'Votre creation personnalisee:\n\n' +
        '🎼 Parametres:\n' +
        '• Style: ' + style + '\n' +
        '• Description: ' + prompt + '\n' +
        '• Duree: ' + (duration || 30) + ' secondes\n' +
        '• Modele: MusicGen Small (Gratuit)\n' +
        '• Service: Hugging Face\n\n' +
        '✅ Generation terminee !\n' +
        '🎧 Votre musique est prete !\n\n' +
        '💡 Note: Version gratuite limitee a 30 secondes\n' +
        '🔄 Vous pouvez generer autant de musiques que vous voulez !';

      return res.status(200).json({ 
        result: successResult,
        status: 'completed',
        audio_data: base64Audio,
        format: 'audio/wav'
      });
    }

    // Autre type de réponse
    const textResponse = await response.text();
    const infoResult = 'Reponse du service musical gratuit:\n\n' +
      'Service: Hugging Face MusicGen\n' +
      'Statut: ' + response.status + '\n' +
      'Reponse: ' + textResponse.substring(0, 500) + '\n\n' +
      'Votre demande:\n' +
      '• Style: ' + style + '\n' +
      '• Description: ' + prompt + '\n\n' +
      'Si vous voyez ce message, le service fonctionne !';

    res.status(200).json({ 
      result: infoResult,
      status: 'info',
      service: 'huggingface_free'
    });

  } catch (error) {
    console.error('Erreur generation musicale gratuite:', error.message);
    
    const fallbackResult = 'Service de generation musicale gratuite\n\n' +
      'Votre composition demandee:\n' +
      '• Style: ' + style + '\n' +
      '• Description: ' + prompt + '\n' +
      '• Duree: ' + (duration || 30) + ' secondes\n\n' +
      'Statut: En developpement\n\n' +
      '🔄 Alternatives gratuites en cours d\'integration:\n' +
      '• Hugging Face MusicGen\n' +
      '• Modeles open source\n' +
      '• APIs gratuites\n\n' +
      '💡 La generation musicale gratuite arrive bientot !\n' +
      'En attendant, le module texte IA fonctionne parfaitement.';

    res.status(500).json({ 
      result: fallbackResult,
      status: 'development',
      error_details: error.message
    });
  }
}
