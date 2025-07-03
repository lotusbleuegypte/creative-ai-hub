// ========================================
// ÉTAPE 1: Dans pages/api/generate-music.js
// Remplacez TOUT le contenu par ce code :
// ========================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, duration } = req.body;

    if (!prompt || !style) {
      return res.status(400).json({ error: 'Prompt et style requis' });
    }

    // Génération des métadonnées
    const musicData = generateAdvancedMusicData(prompt, style, duration);

    // 🎵 VRAIE GÉNÉRATION avec MUBERT API (GRATUIT!)
    let audioUrl = null;
    let realAudio = false;
    
    try {
      console.log('🎵 Génération avec Mubert API...');
      
      const mubertTags = convertToMubertTags(prompt, style, musicData);
      const mubertResponse = await generateMubertTrack(mubertTags, duration);
      
      if (mubertResponse.success) {
        audioUrl = mubertResponse.download_url;
        realAudio = true;
        console.log('✅ Musique générée avec Mubert !');
      }

    } catch (error) {
      console.log('⚠️ Mubert API indisponible:', error.message);
    }

    const result = `🎵 Composition générée avec ${realAudio ? 'MUBERT IA' : 'SIMULATION'} !

📋 Votre composition "${style}" :
• Ambiance : ${prompt}
• Durée : ${duration} secondes
• Qualité : ${realAudio ? 'Professionnelle (Mubert AI)' : 'Simulation Premium'}

🎼 Structure musicale :
${musicData.structure}

🎹 Instruments générés :
${musicData.instruments.map(i => `• ${i}`).join('\n')}

🎵 Caractéristiques :
• Tempo : ${musicData.bpm} BPM
• Tonalité : ${musicData.key}
• Style : ${musicData.description}
• Complexité : ${musicData.complexity}/5
• Ambiance : ${musicData.mood}

${realAudio ? '🎧 VRAIE MUSIQUE IA générée par Mubert !' : '🎧 Simulation audio'}`;

    res.status(200).json({
      success: true,
      result: result,
      audioData: musicData,
      audioUrl: audioUrl,
      webAudioReady: true,
      realAudio: realAudio,
      method: realAudio ? 'Mubert AI' : 'Simulation'
    });

  } catch (error) {
    console.error('Erreur génération musicale:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération musicale'
    });
  }
}

// Toutes les fonctions utilitaires (copiez-les aussi)
async function generateMubertTrack(tags, duration) {
  try {
    // Session publique Mubert
    const sessionResponse = await fetch('https://api-b2b.mubert.com/v2/GetServiceAccess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: "GetServiceAccess",
        params: {
          email: "public@example.com",
          license: "ttmmubertlicense",
          token: "",
          mode: "loop"
        }
      })
    });

    if (!sessionResponse.ok) throw new Error(`Session error: ${sessionResponse.status}`);
    
    const sessionData = await sessionResponse.json();
    const pat = sessionData.data.pat;

    // Générer la musique
    const generateResponse = await fetch('https://api-b2b.mubert.com/v2/RecordTrack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: "RecordTrack",
        params: {
          pat: pat,
          tags: tags,
          mode: "loop",
          duration: Math.min(duration, 300)
        }
      })
    });

    if (!generateResponse.ok) throw new Error(`Generation error: ${generateResponse.status}`);
    
    const generateData = await generateResponse.json();
    
    if (generateData.success && generateData.data?.tasks) {
      const taskId = generateData.data.tasks[0].id;
      const downloadUrl = await waitForMubertGeneration(pat, taskId);
      
      if (downloadUrl) {
        return { success: true, download_url: downloadUrl };
      }
    }

    throw new Error('Generation failed');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function waitForMubertGeneration(pat, taskId) {
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const statusResponse = await fetch('https://api-b2b.mubert.com/v2/CheckTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: "CheckTask",
          params: { pat: pat, task_id: taskId }
        })
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.success && statusData.data?.download_url) {
          return statusData.data.download_url;
        }
      }
    } catch (error) {
      console.log(`Tentative ${attempt + 1} échouée`);
    }
  }
  throw new Error('Timeout');
}

function convertToMubertTags(prompt, style, musicData) {
  const styleTags = {
    electronic: ['electronic', 'edm', 'synth'],
    pop: ['pop', 'mainstream', 'catchy'],
    rock: ['rock', 'guitar', 'drums'],
    jazz: ['jazz', 'piano', 'smooth'],
    classical: ['classical', 'orchestra'],
    ambient: ['ambient', 'chill']
  };

  let tags = styleTags[style] || styleTags.electronic;
  
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('dark')) tags.push('dark');
  if (promptLower.includes('trap')) tags.push('trap');
  if (promptLower.includes('synthwave')) tags.push('synthwave');
  
  return tags.join(',');
}

function generateAdvancedMusicData(prompt, style, duration) {
  const styles = {
    electronic: {
      description: "Synthétiseurs modernes, basses profondes",
      instruments: ["Lead Synth", "Bass Synth", "Electronic Drums"],
      bpm: 128, key: "Am",
      structure: "Intro → Build-up → Drop → Breakdown"
    },
    pop: {
      description: "Mélodie accrocheuse, structure verse-chorus",
      instruments: ["Piano", "Guitare", "Batterie"],
      bpm: 120, key: "C",
      structure: "Intro → Verse → Chorus → Outro"
    }
  };

  const config = styles[style] || styles.electronic;
  
  if (prompt.includes('70 BPM')) config.bpm = 70;
  
  return {
    ...config,
    prompt, style,
    duration: parseInt(duration),
    complexity: 2,
    mood: analyzeMood(prompt)
  };
}

function analyzeMood(prompt) {
  if (prompt.includes('dark')) return 'mystérieux';
  if (prompt.includes('happy')) return 'joyeux';
  return 'neutre';
}

// ========================================
// ÉTAPE 2: Dans votre fichier React principal
// AJOUTEZ ces lignes dans la fonction handleGenerate :
// ========================================

// Remplacez votre handleGenerate par ceci :
const handleGenerate = async () => {
  await onGenerate({ prompt, style, duration });
  
  setAudioData({
    style,
    duration: parseInt(duration),
    prompt,
    bpm: style === 'electronic' ? 128 : 120
  });
};

// ========================================
// ÉTAPE 3: Ajoutez cette fonction APRÈS votre result && (
// ========================================

// Remplacez la section {result && ( par ceci :
{result && (
  <div style={{
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }}>
    <h4 style={{
      color: 'white',
      fontWeight: '600',
      marginBottom: '15px'
    }}>
      📋 Détails de la composition :
    </h4>
    <div style={{
      color: '#e5e5e5',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.6'
    }}>
      {result}
    </div>
    
    {/* NOUVEAU: Gestion audio Mubert */}
    <MubertAudioPlayer />
  </div>
)}

// ========================================
// ÉTAPE 4: Ajoutez ce composant à la fin :
// ========================================

function MubertAudioPlayer() {
  const [audioUrl, setAudioUrl] = useState(null);
  
  useEffect(() => {
    // Récupérer l'URL audio depuis la dernière génération
    // (vous devrez adapter selon votre state management)
    const checkForAudio = async () => {
      // Simuler la récupération de l'URL
      // Dans votre cas réel, vous devrez passer l'audioUrl via props
      if (window.lastGeneratedAudioUrl) {
        setAudioUrl(window.lastGeneratedAudioUrl);
      }
    };
    
    checkForAudio();
  }, [result]);

  if (!audioUrl) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        background: '#28a745',
        color: 'white',
        padding: '10px',
        borderRadius: '10px',
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        🎵 <strong>VRAIE MUSIQUE MUBERT IA</strong>
      </div>
      
      <audio controls style={{ width: '100%', marginBottom: '15px' }}>
        <source src={audioUrl} type="audio/mpeg" />
      </audio>
      
      <div style={{
        background: 'rgba(255, 193, 7, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        📝 Attribution: @mubertapp #mubert
      </div>
    </div>
  );
}
