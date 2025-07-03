// Ajoutez ceci en haut de votre pages/index.js
import { useEffect, useRef, useState } from 'react';

// Remplacez votre fonction MusicAIInterface existante par celle-ci :
function MusicAIInterface({ onGenerate, isGenerating, result }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('electronic');
  const [duration, setDuration] = useState(30);
  const [bpm, setBpm] = useState(120);
  const [key, setKey] = useState('C');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [Tone, setTone] = useState(null);
  const synthRef = useRef(null);
  const transportRef = useRef(null);

  // Chargement dynamique de Tone.js
  useEffect(() => {
    const loadTone = async () => {
      if (typeof window !== 'undefined') {
        const ToneModule = await import('tone');
        setTone(ToneModule.default || ToneModule);
      }
    };
    loadTone();
  }, []);

  // Génération musicale avancée
  const generateAdvancedMusic = async () => {
    if (!Tone) return;

    try {
      // Initialisation audio
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Configuration des instruments
      const instruments = {
        lead: new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.8 }
        }).toDestination(),
        
        bass: new Tone.MonoSynth({
          oscillator: { type: 'square' },
          envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.5 }
        }).toDestination(),
        
        drums: {
          kick: new Tone.MembraneSynth().toDestination(),
          snare: new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
          }).toDestination()
        }
      };

      // Génération de séquence
      const sequence = generateMusicalSequence(style, bpm, duration, key);
      
      // Sauvegarde
      synthRef.current = instruments;
      setCurrentTrack({ instruments, sequence, config: { style, bpm, duration, key, prompt } });

      return { success: true, message: "🎵 Composition générée avec succès!" };

    } catch (error) {
      console.error('Erreur génération:', error);
      return { success: false, message: "❌ Erreur lors de la génération" };
    }
  };

  // Fonction de génération de séquence musicale
  const generateMusicalSequence = (genre, bpm, duration, key) => {
    const scales = getScaleNotes(key);
    const sequence = { melody: [], bass: [], drums: [] };
    
    const totalBeats = Math.floor((duration * bpm) / 60);
    
    // Génération mélodie
    for (let beat = 0; beat < totalBeats; beat += 0.5) {
      if (Math.random() > 0.4) {
        const note = scales[Math.floor(Math.random() * scales.length)] + '4';
        sequence.melody.push({
          time: beat * (60 / bpm),
          note: note,
          duration: '8n',
          velocity: 0.7
        });
      }
    }

    // Génération basse
    for (let beat = 0; beat < totalBeats; beat += 2) {
      const note = scales[0] + '2'; // Note fondamentale
      sequence.bass.push({
        time: beat * (60 / bpm),
        note: note,
        duration: '4n',
        velocity: 0.8
      });
    }

    // Génération percussion
    for (let beat = 0; beat < totalBeats; beat++) {
      if (beat % 4 === 0) { // Kick sur temps forts
        sequence.drums.push({
          time: beat * (60 / bpm),
          instrument: 'kick',
          velocity: 0.9
        });
      }
      if (beat % 4 === 2) { // Snare sur temps faibles
        sequence.drums.push({
          time: beat * (60 / bpm),
          instrument: 'snare',
          velocity: 0.7
        });
      }
    }

    return sequence;
  };

  // Fonction utilitaire pour les gammes
  const getScaleNotes = (key) => {
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const majorPattern = [2, 2, 1, 2, 2, 2, 1];
    
    const rootIndex = chromatic.indexOf(key.replace('m', ''));
    const scale = [key.replace('m', '')];
    let currentIndex = rootIndex;

    for (let i = 0; i < majorPattern.length - 1; i++) {
      currentIndex = (currentIndex + majorPattern[i]) % 12;
      scale.push(chromatic[currentIndex]);
    }

    return scale;
  };

  // Contrôles de lecture
  const playMusic = async () => {
    if (!currentTrack || !Tone) return;

    try {
      await Tone.start();
      setIsPlaying(true);

      const { sequence, instruments } = currentTrack;
      
      // Planification des événements
      sequence.melody.forEach(note => {
        Tone.Transport.scheduleOnce((time) => {
          if (instruments.lead && isPlaying) {
            instruments.lead.triggerAttackRelease(note.note, note.duration, time, note.velocity);
          }
        }, note.time);
      });

      sequence.bass.forEach(note => {
        Tone.Transport.scheduleOnce((time) => {
          if (instruments.bass && isPlaying) {
            instruments.bass.triggerAttackRelease(note.note, note.duration, time, note.velocity);
          }
        }, note.time);
      });

      sequence.drums.forEach(hit => {
        Tone.Transport.scheduleOnce((time) => {
          if (instruments.drums && instruments.drums[hit.instrument] && isPlaying) {
            instruments.drums[hit.instrument].triggerAttackRelease('C2', '16n', time, hit.velocity);
          }
        }, hit.time);
      });

      Tone.Transport.start();

      // Arrêt automatique
      setTimeout(() => {
        stopMusic();
      }, duration * 1000);

    } catch (error) {
      console.error('Erreur lecture:', error);
      setIsPlaying(false);
    }
  };

  const stopMusic = () => {
    if (Tone) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleGenerate = async () => {
    const result = await generateAdvancedMusic();
    if (onGenerate) {
      onGenerate({ prompt, style, duration, bpm, key });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Contrôles existants */}
      <div>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          fontWeight: '600', 
          marginBottom: '10px',
          fontSize: '1.1rem'
        }}>
          Style musical
        </label>
        <select 
          value={style} 
          onChange={(e) => setStyle(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '1rem'
          }}
        >
          <option value="electronic" style={{background: '#1f2937', color: 'white'}}>Électronique</option>
          <option value="pop" style={{background: '#1f2937', color: 'white'}}>Pop</option>
          <option value="rock" style={{background: '#1f2937', color: 'white'}}>Rock</option>
          <option value="jazz" style={{background: '#1f2937', color: 'white'}}>Jazz</option>
          <option value="classical" style={{background: '#1f2937', color: 'white'}}>Classique</option>
          <option value="ambient" style={{background: '#1f2937', color: 'white'}}>Ambient</option>
        </select>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          fontWeight: '600', 
          marginBottom: '10px',
          fontSize: '1.1rem'
        }}>
          Description/Ambiance
        </label>
        <input 
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: mélancolique, énergique, romantique, mystérieux..."
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Nouveaux contrôles */}
      <div>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          fontWeight: '600', 
          marginBottom: '10px',
          fontSize: '1.1rem'
        }}>
          Tempo (BPM): {bpm}
        </label>
        <input 
          type="range"
          min="60"
          max="180"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.2)',
            outline: 'none'
          }}
        />
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          fontWeight: '600', 
          marginBottom: '10px',
          fontSize: '1.1rem'
        }}>
          Tonalité
        </label>
        <select 
          value={key} 
          onChange={(e) => setKey(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '1rem'
          }}
        >
          <option value="C" style={{background: '#1f2937', color: 'white'}}>Do majeur</option>
          <option value="Cm" style={{background: '#1f2937', color: 'white'}}>Do mineur</option>
          <option value="G" style={{background: '#1f2937', color: 'white'}}>Sol majeur</option>
          <option value="Am" style={{background: '#1f2937', color: 'white'}}>La mineur</option>
          <option value="F" style={{background: '#1f2937', color: 'white'}}>Fa majeur</option>
        </select>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          fontWeight: '600', 
          marginBottom: '10px',
          fontSize: '1.1rem'
        }}>
          Durée : {duration} secondes
        </label>
        <input 
          type="range"
          min="15"
          max="120"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.2)',
            outline: 'none'
          }}
        />
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating || !prompt}
        style={{
          width: '100%',
          background: isGenerating || !prompt 
            ? 'rgba(108, 117, 125, 0.5)' 
            : 'linear-gradient(45deg, #8b5cf6, #ec4899)',
          border: 'none',
          padding: '18px',
          borderRadius: '10px',
          color: 'white',
          fontWeight: '600',
          fontSize: '1.1rem',
          cursor: isGenerating || !prompt ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {isGenerating ? '🎵 Composition en cours...' : '🎼 Générer la musique'}
      </button>

      {/* Player amélioré */}
      {currentTrack && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '15px',
          padding: '25px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{
            color: 'white',
            fontWeight: '600',
            marginBottom: '20px',
            fontSize: '1.2rem',
            textAlign: 'center'
          }}>
            🎵 Votre Composition
          </h4>

          {/* Visualisation simple */}
          <div style={{
            height: '60px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isPlaying 
              ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))' 
              : 'rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              {isPlaying ? '🎵 En lecture...' : '⏸️ Prêt à jouer'}
            </div>
          </div>

          {/* Contrôles */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={playMusic}
              disabled={isPlaying}
              style={{
                background: isPlaying 
                  ? 'rgba(108, 117, 125, 0.5)' 
                  : 'linear-gradient(45deg, #10b981, #34d399)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '600',
                cursor: isPlaying ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              ▶️ Jouer
            </button>

            <button 
              onClick={stopMusic}
              style={{
                background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ⏹️ Stop
            </button>

            <button 
              onClick={() => {
                const musicData = {
                  title: `Composition ${style}`,
                  style, bpm, key, duration, prompt,
                  generatedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(musicData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `composition_${style}_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              💾 Télécharger
            </button>
          </div>

          {/* Infos composition */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
            marginTop: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Style</div>
              <div style={{ color: 'white', fontWeight: '600' }}>{style}</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>BPM</div>
              <div style={{ color: 'white', fontWeight: '600' }}>{bpm}</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Tonalité</div>
              <div style={{ color: 'white', fontWeight: '600' }}>{key}</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Durée</div>
              <div style={{ color: 'white', fontWeight: '600' }}>{duration}s</div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            color: '#e5e5e5',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            fontSize: '1rem'
          }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
