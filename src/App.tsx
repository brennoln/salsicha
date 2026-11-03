import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Utensils,
  Heart,
  Moon,
  Sun,
  Sparkles,
  Bath,
  Wifi,
  WifiOff,
  UserCheck,
} from 'lucide-react';
import { Dachshund } from './components/Dachshund';
import { PetState, PetActionType } from './types/pet';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const INITIAL_PET_STATE: PetState = {
  name: 'Romeu',
  hunger: 80,
  happiness: 85,
  energy: 70,
  cleanliness: 90,
  isSleeping: false,
  lastFed: new Date().toISOString(),
  lastPlayed: new Date().toISOString(),
  lastCleaned: new Date().toISOString(),
  lastSlept: new Date().toISOString(),
  lastActionBy: 'Sistema',
  lastActionText: 'O cachorrinho nasceu e está pronto para receber amor!',
};

export const App: React.FC = () => {
  const [pet, setPet] = useState<PetState>(() => {
    const saved = localStorage.getItem('salsicha_pet_state');
    return saved ? JSON.parse(saved) : INITIAL_PET_STATE;
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('salsicha_pet_user') || 'Brenno';
  });

  const [actionEffect, setActionEffect] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isConnected, setIsConnected] = useState(isSupabaseConfigured);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('salsicha_pet_state', JSON.stringify(pet));
  }, [pet]);

  useEffect(() => {
    localStorage.setItem('salsicha_pet_user', currentUser);
  }, [currentUser]);

  // Conexão em tempo real com Supabase (quando configurado)
  useEffect(() => {
    const client = supabase;
    if (!client || !isSupabaseConfigured) {
      setIsConnected(false);
      return;
    }

    // Carregar estado inicial do banco
    const fetchPet = async () => {
      const { data, error } = await client
        .from('pets')
        .select('*')
        .eq('id', 'primary_pet')
        .single();

      if (data && !error) {
        setPet(data.state);
        setIsConnected(true);
      }
    };

    fetchPet();

    // Inscrição em tempo real para atualizações instantâneas!
    const channel = client
      .channel('pet_realtime_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pets', filter: 'id=eq.primary_pet' },
        (payload: any) => {
          if (payload.new && payload.new.state) {
            setPet(payload.new.state);
            setIsConnected(true);
          }
        }
      )
      .subscribe((status: string) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // Sincronizar atualização de estado com Supabase
  const syncToSupabase = async (newState: PetState) => {
    const client = supabase;
    if (client && isSupabaseConfigured) {
      await client
        .from('pets')
        .upsert({ id: 'primary_pet', state: newState, updated_at: new Date().toISOString() });
    }
  };

  const triggerEffect = (effect: string) => {
    setActionEffect(effect);
    setTimeout(() => {
      setActionEffect(null);
    }, 1200);
  };

  const handleAction = async (action: PetActionType) => {
    let updated = { ...pet };

    if (action === 'feed') {
      if (updated.hunger >= 100) return;
      updated.hunger = Math.min(100, updated.hunger + 25);
      updated.happiness = Math.min(100, updated.happiness + 5);
      updated.lastActionText = `${currentUser} deu comidinha gostosa 🍖`;
      triggerEffect('food');
    } else if (action === 'pet') {
      updated.happiness = Math.min(100, updated.happiness + 15);
      updated.lastActionText = `${currentUser} fez muito carinho 💖`;
      triggerEffect('heart');
      if (updated.happiness >= 95) {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      }
    } else if (action === 'play') {
      if (updated.energy < 15) {
        alert(`${pet.name} está cansado demais para brincar agora! Coloque ele para dormir.`);
        return;
      }
      updated.happiness = Math.min(100, updated.happiness + 20);
      updated.energy = Math.max(0, updated.energy - 20);
      updated.hunger = Math.max(0, updated.hunger - 10);
      updated.cleanliness = Math.max(0, updated.cleanliness - 15);
      updated.lastActionText = `${currentUser} brincou de jogar bolinha 🎾`;
      triggerEffect('play');
    } else if (action === 'bath') {
      updated.cleanliness = 100;
      updated.happiness = Math.min(100, updated.happiness + 10);
      updated.lastActionText = `${currentUser} deu um banho bem cheiroso 🛁🫧`;
      triggerEffect('bath');
    } else if (action === 'sleep') {
      updated.isSleeping = true;
      updated.lastActionText = `${currentUser} colocou ${pet.name} para tirar uma soneca 💤`;
    } else if (action === 'wake') {
      updated.isSleeping = false;
      updated.energy = 100;
      updated.lastActionText = `${currentUser} acordou ${pet.name}! Ele está cheio de energia ☀️`;
      confetti({ particleCount: 40, spread: 70 });
    }

    updated.lastActionBy = currentUser;
    setPet(updated);
    await syncToSupabase(updated);
  };

  const getStatusColor = (val: number) => {
    if (val > 60) return 'bg-emerald-500';
    if (val > 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between max-w-md mx-auto transition-colors duration-700 ${
      pet.isSleeping ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 text-amber-950'
    } shadow-2xl relative select-none pb-4`}>
      
      {/* Top Bar / Header */}
      <header className="p-4 pt-6 flex items-center justify-between border-b border-amber-200/50 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">{pet.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-800 border border-amber-400/30">
              Salsichinha 🐾
            </span>
          </div>
          <p className="text-xs opacity-75">Cuidado com amor por vocês dois</p>
        </div>

        {/* Indicador de Conexão Online */}
        <button
          onClick={() => setShowSyncModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs transition-all ${
            isConnected
              ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-400/40'
              : 'bg-amber-500/20 text-amber-800 border border-amber-400/40 animate-pulse'
          }`}
        >
          {isConnected ? (
            <>
              <Wifi size={14} className="text-emerald-600" />
              <span>Conectado</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-amber-700" />
              <span>Modo Local</span>
            </>
          )}
        </button>
      </header>

      {/* Quem está jogando agora? (Alternador rápido) */}
      <div className="px-4 py-2 flex items-center justify-between text-xs bg-amber-200/40 backdrop-blur-xs border-b border-amber-300/30">
        <div className="flex items-center gap-1 font-medium opacity-80">
          <UserCheck size={14} />
          <span>Jogando agora:</span>
        </div>
        <div className="flex bg-white/60 p-0.5 rounded-lg border border-amber-300/50 shadow-xs">
          <button
            onClick={() => setCurrentUser('Brenno')}
            className={`px-3 py-1 rounded-md font-bold transition-all ${
              currentUser === 'Brenno'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 opacity-60 hover:opacity-100'
            }`}
          >
            Brenno 👨‍💻
          </button>
          <button
            onClick={() => setCurrentUser('Meu Amor')}
            className={`px-3 py-1 rounded-md font-bold transition-all ${
              currentUser === 'Meu Amor'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-amber-900 opacity-60 hover:opacity-100'
            }`}
          >
            Meu Amor 💖
          </button>
        </div>
      </div>

      {/* Cenário do Cachorrinho */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 relative">
        <Dachshund
          isSleeping={pet.isSleeping}
          actionEffect={actionEffect}
          happiness={pet.happiness}
          onPet={() => handleAction('pet')}
        />

        {/* Última ação realizada */}
        <div className="mt-4 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-amber-200 shadow-sm text-center max-w-xs transition-all">
          <p className="text-xs font-semibold text-amber-950 flex items-center justify-center gap-1">
            <Sparkles size={14} className="text-amber-500" />
            {pet.lastActionText}
          </p>
        </div>
      </main>

      {/* Painel de Status */}
      <div className="px-5 space-y-2.5 my-2">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Fome */}
          <div className="bg-white/80 p-2.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">🍖 Fome</span>
              <span>{pet.hunger}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getStatusColor(pet.hunger)}`}
                style={{ width: `${pet.hunger}%` }}
              />
            </div>
          </div>

          {/* Felicidade */}
          <div className="bg-white/80 p-2.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">💖 Felicidade</span>
              <span>{pet.happiness}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getStatusColor(pet.happiness)}`}
                style={{ width: `${pet.happiness}%` }}
              />
            </div>
          </div>

          {/* Energia */}
          <div className="bg-white/80 p-2.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">⚡ Energia</span>
              <span>{pet.energy}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getStatusColor(pet.energy)}`}
                style={{ width: `${pet.energy}%` }}
              />
            </div>
          </div>

          {/* Higiene */}
          <div className="bg-white/80 p-2.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1">🫧 Higiene</span>
              <span>{pet.cleanliness}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getStatusColor(pet.cleanliness)}`}
                style={{ width: `${pet.cleanliness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação na Base */}
      <footer className="px-4 pt-2">
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-3xl border border-amber-300 shadow-lg grid grid-cols-5 gap-1.5">
          {/* Alimentar */}
          <button
            onClick={() => handleAction('feed')}
            disabled={pet.isSleeping || pet.hunger >= 100}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-95 disabled:opacity-40 transition-all text-amber-900"
          >
            <Utensils size={20} className="text-amber-600 mb-0.5" />
            <span className="text-[10px] font-bold">Comida</span>
          </button>

          {/* Carinho */}
          <button
            onClick={() => handleAction('pet')}
            disabled={pet.isSleeping}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-95 disabled:opacity-40 transition-all text-rose-900"
          >
            <Heart size={20} className="text-rose-500 mb-0.5" />
            <span className="text-[10px] font-bold">Carinho</span>
          </button>

          {/* Brincar */}
          <button
            onClick={() => handleAction('play')}
            disabled={pet.isSleeping || pet.energy < 15}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-lime-50 hover:bg-lime-100 active:scale-95 disabled:opacity-40 transition-all text-lime-900"
          >
            <span className="text-lg leading-none mb-0.5">🎾</span>
            <span className="text-[10px] font-bold">Brincar</span>
          </button>

          {/* Banho */}
          <button
            onClick={() => handleAction('bath')}
            disabled={pet.isSleeping}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-cyan-50 hover:bg-cyan-100 active:scale-95 disabled:opacity-40 transition-all text-cyan-900"
          >
            <Bath size={20} className="text-cyan-600 mb-0.5" />
            <span className="text-[10px] font-bold">Banho</span>
          </button>

          {/* Dormir / Acordar */}
          {pet.isSleeping ? (
            <button
              onClick={() => handleAction('wake')}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-500 text-white active:scale-95 transition-all shadow-md animate-bounce"
            >
              <Sun size={20} className="mb-0.5" />
              <span className="text-[10px] font-bold">Acordar</span>
            </button>
          ) : (
            <button
              onClick={() => handleAction('sleep')}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all text-indigo-900"
            >
              <Moon size={20} className="text-indigo-600 mb-0.5" />
              <span className="text-[10px] font-bold">Dormir</span>
            </button>
          )}
        </div>
      </footer>

      {/* Modal de Conexão Online (Multiplayer) */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="text-amber-500" size={20} />
                <h3 className="font-bold text-lg">Modo Conectado 🐾</h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold px-2 text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para você e sua namorada jogarem no mesmo cachorrinho em tempo real de celulares diferentes, conectamos com um banco gratuito no <strong>Supabase</strong>!
            </p>

            <div className="space-y-2 text-xs bg-amber-50 p-3 rounded-2xl border border-amber-200">
              <p className="font-semibold text-amber-900">Como ativar o multiplayer:</p>
              <ol className="list-decimal pl-4 space-y-1 text-amber-800">
                <li>Crie um projeto gratuito em <strong>supabase.com</strong>.</li>
                <li>Copie a <strong>Project URL</strong> e <strong>Anon Key</strong>.</li>
                <li>Adicione no arquivo <code>.env</code> do projeto.</li>
              </ol>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSyncModal(false)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
              >
                Entendi, continuar jogando!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
