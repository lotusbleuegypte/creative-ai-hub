// pages/api/generate-music.js – version musicgen.ai (public, sans token)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { prompt, style = 'electronic', duration = 30 } = req.body;

    if (!prompt || prompt.length < 5) {
      return res.status(400).json({ error: 'Prompt invalide' });
    }

    const fullPrompt = `${style} music, ${prompt}`;

    console.log("🎵 Appel à musicgen.ai...");

    const response = await fetch('https://musicgen.ai/api/musicgen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: fullPrompt })
    });

    if (!response.ok) {
      throw new Error('Serveur musicgen.ai injoignable');
    }

    const data = await response.json();

    if (!data || !data.output || !data.output.url) {
      throw new Error('Aucune URL audio retournée');
    }

    const audioURL = data.output.url;

    // Télécharger le mp3 et encoder en base64
    const audioResponse = await fetch(audioURL);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    const resultText = `🎵 Composition générée avec musicgen.ai ✅\n\n• Style : ${style}\n• Prompt : ${prompt}\n• Durée estimée : ${duration} sec\n• Format : .mp3 (base64 encodé)\n• Source : ${audioURL}`;

    res.status(200).json({
      success: true,
      result: resultText,
      audioBase64,
      realAudio: true,
      audioUrl: audioURL,
      mimeType: "audio/mpeg"
    });

  } catch (err) {
    console.error('❌ Erreur musicgen.ai :', err);
    res.status(500).json({
      error: 'Erreur serveur lors de la génération musicale',
      details: err.message
    });
  }
}
