import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [activeModal, setActiveModal] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  const modules = [
    {
      id: 'text',
      icon: '🧠',
      title: 'Assistant Texte IA',
      description: 'Votre copilote d\'écriture intelligent',
      status: 'demo',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'music',
      icon: '🎼',
      title: 'Générateur Musical IA',
      description: 'Créez des compositions musicales uniques',
      status: 'soon',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'voice',
      icon: '🔁',
      title: 'Synthèse Vocale IA',
      description: 'Transformez le texte en parole naturelle',
      status: 'soon',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'video',
      icon: '🎥',
      title: 'Création Vidéo IA',
      description: 'Générez des vidéos professionnelles',
      status: 'soon',
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
        setResult(`Erreur: ${data.error}`);
      } else {
        setResult(data.result);
      }
    } catch (error) {
      setResult('Erreur de connexion. Vérifiez votre internet.');
    }

    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <Head>
        <title>CreativeAI Hub - Plateforme IA Créative</title>
        <meta name="description" content="Plateforme tout-en-un pour la création avec l'IA" />
      </Head>

      <header className="text-center py-16 px-4">
        <h1 className="text-6xl font-bold mb-6" style={{
          background: 'linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          CreativeAI Hub
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Votre plateforme tout-en-un pour créer avec l'intelligence artificielle
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((module) => (
            <div
              key={module.id}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setActiveModal(module.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-4xl" style={{
                background: `linear-gradient(45deg, ${module.color.includes('orange') ? '#f97316, #ef4444' : 
                  module.color.includes('purple') ? '#8b5cf6, #ec4899' :
                  module.color.includes('blue') ? '#3b82f6, #06b6d4' : 
                  '#10b981, #14b8a6'})`
              }}>
                {module.icon}
              </div>
              
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                module.status === 'demo' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                'bg-gray-500 bg-opacity-20 text-gray-300'
              }`}>
                {module.status === 'demo' ? 'FONCTIONNEL' : 'BIENTÔT'}
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">{module.title}</h3>
              <p className="text-gray-300 mb-6">{module.description}</p>
              
              <button className={`w-full py-3 px-6 rounded-full font-semibold transition-all ${
                module.status === 'soon' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
              }`}>
                {module.status === 'soon' ? 'Bientôt disponible' : 'Essayer maintenant'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="rounded-3xl p-8 max-w-2xl w-full border" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {modules.find(m => m.id === activeModal)?.title}
              </h2>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-white opacity-60 hover:opacity-100 text-2xl"
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
          </div>
        </div>
      )}
    </div>
  );
}

function TextAIInterface({ onGenerate, isGenerating, result }) {
  const [prompt, setPrompt] = useState('');
  const [task, setTask] = useState('creative');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-semibold mb-2">Type de tâche</label>
        <select 
          value={task} 
          onChange={(e) => setTask(e.target.value)}
          className="w-full p-3 rounded-lg text-white"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <option value="creative" style={{background: '#1f2937', color: 'white'}}>Rédaction créative</option>
          <option value="correct" style={{background: '#1f2937', color: 'white'}}>Correction orthographique</option>
          <option value="translate" style={{background: '#1f2937', color: 'white'}}>Traduction</option>
          <option value="summary" style={{background: '#1f2937', color: 'white'}}>Résumé de texte</option>
        </select>
      </div>

      <div>
        <label className="block text-white font-semibold mb-2">Votre texte</label>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Entrez votre texte ici..."
          className="w-full p-3 rounded-lg text-white h-32"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        />
      </div>

      <button 
        onClick={() => onGenerate({ prompt, task })}
        disabled={isGenerating || !prompt}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {isGenerating ? 'Génération en cours...' : 'Traiter le texte'}
      </button>

      {result && (
        <div className="rounded-lg p-4 max-h-60 overflow-y-auto" style={{
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <h4 className="text-white font-semibold mb-2">Résultat :</h4>
          <p className="text-gray-300 whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
