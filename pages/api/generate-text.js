export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, task } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requis' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Clé API OpenAI manquante dans les variables d\'environnement' });
  }

  try {
    let systemPrompt = '';
    
    switch (task) {
      case 'creative':
        systemPrompt = 'Tu es un assistant créatif qui réécrit les textes de manière engageante et captivante en français.';
        break;
      case 'correct':
        systemPrompt = 'Tu es un correcteur expert qui corrige l\'orthographe, la grammaire et améliore le style en français.';
        break;
      case 'translate':
        systemPrompt = 'Tu es un traducteur professionnel qui traduit du français vers l\'anglais de manière naturelle.';
        break;
      case 'summary':
        systemPrompt = 'Tu es un expert en synthèse qui crée des résumés clairs et concis en français.';
        break;
      default:
        systemPrompt = 'Tu es un assistant IA polyvalent et utile qui répond en français.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    res.status(200).json({ result });
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération de texte',
      details: error.message
    });
  }
}
