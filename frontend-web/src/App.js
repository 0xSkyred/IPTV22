import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Settings, Play, Activity, ShieldAlert, BarChart3, Database } from 'lucide-react';

// --- COMPONENTE PLAYER ---
const VideoPlayer = ({ url, type }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });
      
      // Detecção de Tags CUE (Anúncios SSAI)
      hls.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
        console.log('Detected Metadata (SSAI Cues):', data);
      });
    }
  }, [url]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-2xl">
      <video ref={videoRef} controls muted className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-orange-600 px-3 py-1 rounded text-xs font-bold uppercase">
        {type === 'live' ? '• Ao Vivo (Bypass AI)' : 'VOD (IA Dubbed)'}
      </div>
    </div>
  );
};

// --- DASHBOARD PRINCIPAL ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [streams, setStreams] = useState([
    { id: 1, name: 'Futebol - Premier League', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', type: 'live' },
    { id: 2, name: 'Filme: Interstellar', url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', type: 'vod' }
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 text-orange-500">
          <Activity size={32} strokeWidth={3} />
          <h1 className="text-xl font-black tracking-tight uppercase">Stream IA</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BarChart3 size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('streams')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'streams' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Play size={20} /> Meus Streams
          </button>
          <button onClick={() => setActiveTab('quota')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'quota' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Database size={20} /> Controle de Quota
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold">Painel de Controle</h2>
                <p className="text-slate-400 mt-1">Gerenciamento de infraestrutura e latência de IA.</p>
              </div>
              <div className="bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-3 border border-slate-700">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Backend: Online</span>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-slate-500 mb-4">
                  <span className="text-sm font-bold uppercase tracking-wider">Quota Mensal</span>
                  <Database size={18} />
                </div>
                <div className="text-4xl font-bold mb-2">10h / 10h</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 w-1/4 h-full"></div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Você usou 25% do seu orçamento de processamento.</p>
              </div>
              
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-slate-500 mb-4">
                  <span className="text-sm font-bold uppercase tracking-wider">Latência Live</span>
                  <Activity size={18} />
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">120ms</div>
                <p className="text-xs text-slate-500">Média global de bypass (sem dublagem).</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-orange-500/20 bg-orange-500/5">
                <div className="flex justify-between text-orange-500 mb-4">
                  <span className="text-sm font-bold uppercase tracking-wider">Atenção</span>
                  <ShieldAlert size={18} />
                </div>
                <p className="text-sm text-orange-200">2 jobs de VOD estão na fila. O processador local está em 60% de uso.</p>
              </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Play className="text-orange-500" /> Preview do Player
                </h3>
                <VideoPlayer url={streams[0].url} type={streams[0].type} />
                <div className="mt-6 flex gap-4">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition">Configurar SSAI</button>
                  <button className="flex-1 bg-orange-600 hover:bg-orange-500 py-3 rounded-xl font-bold transition">Trocar Canal</button>
                </div>
              </section>

              <section className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
                <h3 className="text-xl font-bold mb-6">Logs de Processamento (VOD)</h3>
                <div className="space-y-4 font-mono text-sm">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-slate-100 font-bold">Interstellar_PTBR.mp4</div>
                      <div className="text-slate-500 text-xs mt-1">UUID: job_9982-x3</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">Processando (75%)</span>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-slate-100 font-bold">Nature_Wild_ES.mp4</div>
                      <div className="text-slate-500 text-xs mt-1">UUID: job_2210-a1</div>
                    </div>
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Concluído</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
