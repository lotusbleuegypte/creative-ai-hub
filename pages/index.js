import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [activeModal, setActiveModal] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [particles, setParticles] = useState([]);

  // Génération de particules pour l'arrière-plan
  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      });
    }
    setParticles(particleArray);

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.speedX,
        y: particle.y + particle.speedY,
        x: particle.x > (typeof window !== 'undefined' ? window.innerWidth : 1000) ? 0 : particle.x < 0 ? (typeof window !== 'undefined' ? window.innerWidth : 1000) : particle.x,
        y: particle.y > (typeof window !== 'undefined' ? window.innerHeight : 800) ? 0 : particle.y < 0 ? (typeof window !== 'undefined' ? window.innerHeight : 800) : particle.y,
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    {
      id: 'text',
      icon: '🧠',
      title: 'Assistant Texte IA',
      description: 'Votre copilote d\'écriture intelligent. Rédaction, correction, traduction et analyse de texte avancée.',
      status: 'demo',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'music',
      icon: '🎼',
      title: 'Générateur Musical IA',
      description: 'Créez des compositions musicales uniques avec notre IA inspirée de Suno. Générez des mélodies complètes.',
      status: 'demo',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'voice',
      icon: '🔁',
      title: 'Synthèse Vocale IA',
      description: 'Transformez le texte en parole naturelle ou clonez des voix avec notre technologie avancée.',
      status: 'demo',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'video',
      icon: '🎥',
      title: 'Création Vidéo IA',
      description: 'Générez des vidéos professionnelles avec des outils similaires à Runway. De l\'idée au montage final.',
      status: 'demo',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const generateContent = async (type, params) => {
    setIsGenerating(true);
    setResult('');

    try {
      const response = await fetch(`/api/generate-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      if (data.error) {
        setResult(`❌ Erreur: ${data.error}`);
      } else {
        setResult(data.result);
        
        if (type === 'music' && (data.audioBase64 || data.audioUrl)) {
          if (typeof window !== 'undefined') {
            window.lastMusicGeneration = data;
          }
        }
      }
    } catch (error) {
      setResult('❌ Erreur de connexion. Vérifiez votre internet.');
    }

    setIsGenerating(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Head>
        <title>CreativeAI Hub - Plateforme IA Créative</title>
        <meta name="description" content="Plateforme tout-en-un pour la création avec l'IA" />
      </Head>

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: 'twinkle 3s infinite ease-in-out'
            }}
          />
        ))}
      </div>

      <header style={{ textAlign: 'center', padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: '800',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '30px',
          animation: 'gradientShift 4s ease infinite'
        }}>
          CreativeAI Hub
        </h1>
        <p style={{
          fontSize: '1.5rem',
          color: 'rgba(255, 255, 255, 0.9)',
          maxWidth: '800px',
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          Votre plateforme tout-en-un pour créer avec l'intelligence artificielle
        </p>
      </header>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 20px 80px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '40px',
          marginBottom: '80px'
        }}>
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => setActiveModal(module.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '25px',
                padding: '40px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-10px) scale(1.02)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <div style={{
                fontSize: '4rem',
                marginBottom: '25px',
                display: 'block'
              }}>
                {module.icon}
              </div>

              <div style={{
                display: 'inline-block',
                padding: '8px 20px',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '25px',
                background: module.status === 'demo' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(108, 117, 125, 0.2)',
                color: module.status === 'demo' ? '#ffc107' : '#6c757d',
                border: `1px solid ${module.status === 'demo' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(108, 117, 125, 0.3)'}`
              }}>
                {module.status === 'demo' ? 'FONCTIONNEL' : 'BIENTÔT'}
              </div>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '20px'
              }}>
                {module.title}
              </h3>

              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6',
                marginBottom: '30px',
                fontSize: '1.1rem'
              }}>
                {module.description}
              </p>

              <button style={{
                background: module.status === 'soon' 
                  ? 'rgba(108, 117, 125, 0.5)' 
                  : `linear-gradient(45deg, ${module.color.includes('orange') ? '#f97316, #ef4444' : 
                    module.color.includes('purple') ? '#8b5cf6, #ec4899' :
                    module.color.includes('blue') ? '#3b82f6, #06b6d4' : 
                    '#10b981, #14b8a6'})`,
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '600',
                cursor: module.status === 'soon' ? 'not-allowed' : 'pointer',
                width: '100%',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease'
              }}>
                {module.status === 'soon' ? 'Bientôt disponible' : 'Essayer maintenant'}
              </button>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(25px)',
          borderRadius: '30px',
          padding: '50px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '25px' }}>🎛️</div>
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '25px',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Hub Multimodal Centralisé
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}>
            Combinez tous les outils dans un workflow unifié. Créez des projets complexes en utilisant plusieurs IA simultanément.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            margin: '40px 0',
            flexWrap: 'wrap'
          }}>
            {['📝 Texte', '🎵 Musique', '🎭 Voix', '🎬 Vidéo'].map((step, index) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '15px 25px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  minWidth: '120px',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {step}
                </div>
                {index < 3 && (
                  <div style={{
                    fontSize: '1.5rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: '0 10px'
                  }}>→</div>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setActiveModal('multimodal')}
            style={{
              background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
              border: 'none',
              padding: '18px 40px',
              borderRadius: '25px',
              color: 'white',
              fontWeight: '600',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Accéder au Hub Multimodal
          </button>
        </div>
      </div>

      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '25px',
            padding: '40px',
            maxWidth: '700px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {modules.find(m => m.id === activeModal)?.title || 'Hub Multimodal'}
              </h2>
              <button 
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  padding: '5px 10px'
                }}
              >
                ×
              </button>
            </div>

            {activeModal === 'text' && (
              <TextAIInterface 
                onGenerate={(params) => generateContent('text', params)}
                isGenerating={isGenerating}
                result={result}
              />
            )}

            {activeModal === 'music' && (
              <MusicAIInterface 
                onGenerate={(params) => generateContent('music', params)}
                isGenerating={isGenerating}
                result={result}
              />
            )}

            {activeModal === 'voice' && (
              <VoiceAIInterface 
                onGenerate={(params) => generateContent('voice', params)}
                isGenerating={isGenerating}
                result={result}
              />
            )}

            {activeModal === 'video' && (
              <VideoAIInterface 
                onGenerate={(params) => generateContent('video', params)}
                isGenerating={isGenerating}
                result={result}
              />
            )}

            {activeModal === 'multimodal' && (
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚧</div>
                <h3 style={{ marginBottom: '15px' }}>Hub Multimodal en développement</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Cette fonctionnalité sera disponible prochainement !
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function TextAIInterface({ onGenerate, isGenerating, result }) {
  const [prompt, setPrompt] = useState('');
  const [task, setTask] = useState('creative');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          fontWeight: '600', 
          marginBottom: '10px',
          fontSize: '1.1rem'
        }}>
          Type de tâche
        </label>
        <select 
          value={task} 
          onChange={(e) => setTask(e.target.value)}
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
          <option value="creative" style={{background: '#1f2937', color: 'white'}}>Rédaction créative</option>
          <option value="correct" style={{background: '#1f2937', color: 'white'}}>Correction orthographique</option>
          <option value="translate" style={{background: '#1f2937', color: 'white'}}>Traduction</option>
          <option value="summary" style={{background: '#1f2937', color: 'white'}}>Résumé de texte</option>
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
          Votre texte
        </label>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Entrez votre texte ici..."
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '1rem',
            minHeight: '120px',
            resize: 'vertical'
          }}
        />
      </div>

      <button 
        onClick={() => onGenerate({ prompt, task })}
        disabled={isGenerating || !prompt}
        style={{
          width: '100%',
          background: isGenerating || !prompt 
            ? 'rgba(108, 117, 125, 0.5)' 
            : 'linear-gradient(45deg, #f97316, #ef4444)',
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
        {isGenerating ? '🔄 Génération en cours...' : '✨ Traiter le texte'}
      </button>

      {result && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          padding: '20px',
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{
            color: 'white',
            fontWeight: '600',
            marginBottom: '15px',
            fontSize: '1.1rem'
          }}>
            ✅ Résultat :
          </h4>
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

function MusicAIInterface({ onGenerate, isGenerating, result }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('electronic');
  const [duration, setDuration] = useState(30);
  const [musicGeneration, setMusicGeneration] = useState(null);

  const handleGenerate = async () => {
    await onGenerate({ prompt, style, duration });
  };

  // Gérer window côté client seulement
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lastMusicGeneration) {
      setMusicGeneration(window.lastMusicGeneration);
    }
  }, [result]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          fontWeight: '600', 
          marginBottom: '10px',
          fontSize: '1.1rem'
        }}>
          🎵 Style musical
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
          <option value="electronic" style={{background: '#1f2937'}}>🎛️ Électronique - EDM/Dubstep</option>
          <option value="pop" style={{background: '#1f2937'}}>🎤 Pop - Radio Friendly</option>
          <option value="rock" style={{background: '#1f2937'}}>🎸 Rock - Guitares puissantes</option>
          <option value="jazz" style={{background: '#1f2937'}}>🎺 Jazz - Sophistiqué</option>
          <option value="classical" style={{background: '#1f2937'}}>🎼 Classique - Orchestral</option>
          <option value="ambient" style={{background: '#1f2937'}}>🌙 Ambient - Atmosphérique</option>
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
          ✨ Description musicale
        </label>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décrivez l'ambiance et le style de votre musique...

Exemples :
• Musique électronique énergique pour danser
• Ballade pop romantique et mélancolique  
• Rock puissant avec des solos de guitare
• Jazz doux pour un café parisien"
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '1rem',
            minHeight: '100px',
            resize: 'vertical',
            lineHeight: '1.5'
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
          ⏱️ Durée : {duration} secondes
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem',
          marginTop: '5px'
        }}>
          <span>15s</span>
          <span>120s</span>
        </div>
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating || !prompt || prompt.length < 10}
        style={{
          width: '100%',
          background: isGenerating || !prompt || prompt.length < 10
            ? 'rgba(108, 117, 125, 0.5)' 
            : 'linear-gradient(45deg, #8b5cf6, #ec4899)',
          border: 'none',
          padding: '18px',
          borderRadius: '15px',
          color: 'white',
          fontWeight: '600',
          fontSize: '1.2rem',
          cursor: isGenerating || !prompt || prompt.length < 10 ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {isGenerating ? '🎵 Composition en cours...' : '🎼 Générer la musique'}
      </button>

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
            marginBottom: '15px',
            fontSize: '1.1rem'
          }}>
            📋 Détails de la composition :
          </h4>
          <div style={{
            color: '#e5e5e5',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            fontSize: '1rem'
          }}>
            {result}
          </div>

          {/* Lecteur pour vraie musique URL */}
          {musicGeneration && musicGeneration.audioUrl && (
            <div style={{ marginTop: '20px' }}>
              <div style={{
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                🎵 <strong>VRAIE MUSIQUE SUNO AI</strong> - Qualité Radio
              </div>
              
              <audio 
                controls 
                style={{ width: '100%' }}
                src={musicGeneration.audioUrl}
                preload="auto"
              >
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
              
              <div style={{
                background: 'rgba(0, 255, 127, 0.1)',
                border: '1px solid rgba(0, 255, 127, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                marginTop: '10px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                ✅ <strong>Générée par Suno AI</strong> - Qualité professionnelle !
              </div>
            </div>
          )}

          {/* Lecteur pour simulation audio */}
          {musicGeneration && musicGeneration.audioBase64 && !musicGeneration.audioUrl && (
            <div style={{ marginTop: '20px' }}>
              <div style={{
                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                🎵 <strong>VOTRE MUSIQUE GÉNÉRÉE</strong> - Multi-instrumental
              </div>
              
              <audio 
                controls 
                style={{ width: '100%' }}
                src={`data:audio/wav;base64,${musicGeneration.audioBase64}`}
              >
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VoiceAIInterface({ onGenerate, isGenerating, result }) {
  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔁</div>
      <h3>Synthèse Vocale IA</h3>
      <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        Cette fonctionnalité sera disponible prochainement !
      </p>
    </div>
  );
}

function VideoAIInterface({ onGenerate, isGenerating, result }) {
  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎥</div>
      <h3>Création Vidéo IA</h3>
      <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        Cette fonctionnalité sera disponible prochainement !
      </p>
    </div>
  );
}
