export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, task } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  try {
    // Test 1: Vérifier la variable d'environnement
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      const debugResult = 'DIAGNOSTIC API TEXTE\n\n' +
        'Probleme identifie: Variable OPENAI_API_KEY manquante\n\n' +
        'Solution:\n' +
        '1. Verifiez vos variables d\'environnement sur Netlify\n' +
        '2. Assurez-vous que OPENAI_API_KEY existe\n' +
        '3. Recreez la variable si necessaire\n\n' +
        'Variables disponibles: ' + Object.keys(process.env).filter(key => key.includes('OPENAI')).join(', ');
      
      return res.status(500).json({ result: debugResult });
    }

    // Test 2: Vérifier la connectivité OpenAI
    console.log('Test connectivite OpenAI...');
    
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': 'Bearer ' + apiKey,
      }
    });

    console.log('Status test OpenAI:', testResponse.status);

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      const debugResult = 'DIAGNOSTIC API TEXTE\n\n' +
        'Probleme identifie: Erreur OpenAI API\n' +
        'Status: ' + testResponse.status + '\n' +
        'Erreur: ' + errorText + '\n\n' +
        'Solutions possibles:\n' +
        '• Cle API OpenAI invalide ou expiree\n' +
        '• Quota OpenAI depasse\n' +
        '• Probleme de facturation OpenAI\n\n' +
        'Cle presente: ' + (apiKey ? 'OUI (' + apiKey.substring(0, 10) + '...)' : 'NON');
      
      return res.status(500).json({ result: debugResult });
    }

    // Test 3: Essayer une génération simple
    let systemPrompt = '';
    switch (task) {
      case 'creative':
        systemPrompt = 'Tu es un assistant créatif qui réécrit les textes de manière engageante en français.';
        break;
      case 'correct':
        systemPrompt = 'Tu es un correcteur expert en français.';
        break;
      case 'translate':
        systemPrompt = 'Tu es un traducteur professionnel français-anglais.';
        break;
      case 'summary':
        systemPrompt = 'Tu es un expert en synthèse qui crée des résumés en français.';
        break;
      default:
        systemPrompt = 'Tu es un assistant IA utile qui répond en français.';
    }

    console.log('Tentative generation avec prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    console.log('Status generation:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      const debugResult = 'DIAGNOSTIC API TEXTE\n\n' +
        'Probleme identifie: Erreur lors de la generation\n' +
        'Status: ' + response.status + '\n' +
        'Erreur OpenAI: ' + JSON.stringify(errorData, null, 2) + '\n\n' +
        'Parametres testes:\n' +
        '• Prompt: ' + prompt + '\n' +
        '• Task: ' + task + '\n' +
        '• Model: gpt-3.5-turbo\n\n' +
        'Solutions:\n' +
        '• Verifiez votre quota OpenAI\n' +
        '• Verifiez votre facturation\n' +
        '• Essayez avec un prompt plus court';
      
      return res.status(500).json({ result: debugResult });
    }

    // Succès !
    const data = await response.json();
    const result = data.choices[0].message.content;

    console.log('Generation reussie !');

    const successResult = 'GENERATION TEXTE IA REUSSIE !\n\n' +
      'Diagnostic: Tout fonctionne correctement\n\n' +
      'Parametres:\n' +
      '• Task: ' + task + '\n' +
      '• Prompt: ' + prompt + '\n' +
      '• Model: gpt-3.5-turbo\n\n' +
      'Resultat genere:\n' +
      '"' + result + '"\n\n' +
      'Votre configuration OpenAI est parfaite !';

    res.status(200).json({ result: successResult });

  } catch (error) {
    console.error('Erreur complete:', error);
    
    const errorResult = 'DIAGNOSTIC API TEXTE\n\n' +
      'Probleme identifie: Erreur JavaScript\n' +
      'Type: ' + error.name + '\n' +
      'Message: ' + error.message + '\n\n' +
      'Cette erreur nous aide a identifier le probleme exact.\n' +
      'Partagez ce diagnostic pour une resolution rapide.';

    res.status(500).json({ result: errorResult });
  }
}
