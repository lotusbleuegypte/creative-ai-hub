export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, task } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  try {
    // Test de diagnostic complet
    const apiKey = process.env.OPENAI_API_KEY;
    
    let diagnostic = 'DIAGNOSTIC NOUVELLE CLE OPENAI\n\n';
    
    // Test 1: Vérifier la présence de la clé
    if (!apiKey) {
      diagnostic += '❌ PROBLEME: Variable OPENAI_API_KEY manquante\n\n';
      diagnostic += 'SOLUTION:\n';
      diagnostic += '1. Allez sur Netlify → Site settings → Environment variables\n';
      diagnostic += '2. Ajoutez OPENAI_API_KEY avec votre nouvelle cle\n';
      diagnostic += '3. Redeployez le site\n\n';
      
      return res.status(500).json({ result: diagnostic });
    }
    
    diagnostic += '✅ Variable OPENAI_API_KEY presente\n';
    diagnostic += 'Cle: ' + apiKey.substring(0, 10) + '...\n';
    diagnostic += 'Longueur: ' + apiKey.length + ' caracteres\n\n';
    
    // Test 2: Vérifier le format de la clé
    if (!apiKey.startsWith('sk-')) {
      diagnostic += '❌ PROBLEME: Format de cle invalide\n';
      diagnostic += 'La cle doit commencer par "sk-"\n';
      diagnostic += 'Votre cle commence par: ' + apiKey.substring(0, 3) + '\n\n';
      
      return res.status(500).json({ result: diagnostic });
    }
    
    diagnostic += '✅ Format de cle correct (commence par sk-)\n\n';
    
    // Test 3: Test de connectivité OpenAI
    diagnostic += 'Test de connectivite OpenAI...\n';
    
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': 'Bearer ' + apiKey,
      }
    });
    
    diagnostic += 'Status de reponse: ' + testResponse.status + '\n';
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      diagnostic += '❌ PROBLEME: Erreur OpenAI API\n';
      diagnostic += 'Erreur: ' + errorText.substring(0, 200) + '\n\n';
      
      if (testResponse.status === 401) {
        diagnostic += 'CAUSE: Cle API invalide ou expiree\n';
        diagnostic += 'SOLUTION: Recreez une nouvelle cle sur platform.openai.com\n';
      } else if (testResponse.status === 429) {
        diagnostic += 'CAUSE: Quota depasse sur cette nouvelle cle aussi\n';
        diagnostic += 'SOLUTION: Verifiez votre facturation OpenAI\n';
      }
      
      return res.status(500).json({ result: diagnostic });
    }
    
    diagnostic += '✅ OpenAI API accessible\n\n';
    
    // Test 4: Test de génération simple
    diagnostic += 'Test de generation simple...\n';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Dis juste "Test réussi" en français.' }
        ],
        max_tokens: 10
      }),
    });
    
    diagnostic += 'Status generation: ' + response.status + '\n';
    
    if (!response.ok) {
      const errorData = await response.json();
      diagnostic += '❌ PROBLEME: Erreur lors de la generation\n';
      diagnostic += 'Erreur: ' + JSON.stringify(errorData, null, 2) + '\n\n';
      
      return res.status(500).json({ result: diagnostic });
    }
    
    const data = await response.json();
    const result = data.choices[0].message.content;
    
    diagnostic += '✅ Generation reussie!\n';
    diagnostic += 'Reponse IA: "' + result + '"\n';
    diagnostic += 'Tokens utilises: ' + (data.usage?.total_tokens || 'N/A') + '\n\n';
    
    diagnostic += '🎉 CONCLUSION: Votre nouvelle cle OpenAI fonctionne parfaitement!\n\n';
    diagnostic += 'PROCHAINE ETAPE:\n';
    diagnostic += '1. Remplacez le code API par la version finale\n';
    diagnostic += '2. Votre module texte sera 100% operationnel\n\n';
    
    diagnostic += 'TEST AVEC VOTRE PROMPT:\n';
    diagnostic += 'Prompt: "' + prompt + '"\n';
    diagnostic += 'Task: ' + task + '\n';
    diagnostic += 'Tout est pret pour la generation!';

    res.status(200).json({ 
      result: diagnostic,
      test_successful: true,
      api_response: result
    });

  } catch (error) {
    const errorDiagnostic = 'ERREUR CRITIQUE DETECTEE\n\n' +
      'Type: ' + error.name + '\n' +
      'Message: ' + error.message + '\n' +
      'Stack: ' + (error.stack || '').substring(0, 300) + '\n\n' +
      'Cette erreur nous aide a identifier le probleme exact.';

    res.status(500).json({ 
      result: errorDiagnostic,
      error_details: {
        name: error.name,
        message: error.message
      }
    });
  }
}
