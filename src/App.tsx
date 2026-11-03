import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Wifi,
  WifiOff,
  UserCheck,
  Coins,
  Home,
  UtensilsCrossed,
  Bath,
  Moon,
  Gamepad2,
  ShoppingBag,
} from 'lucide-react';
import { Dachshund } from './components/Dachshund';
import { Kitchen } from './components/Kitchen';
import { Bathroom } from './components/Bathroom';
import { Bedroom } from './components/Bedroom';
import { Shop } from './components/Shop';
import { MinigamesHub } from './components/Minigames/MinigamesHub';
import { PetState, RoomType } from './types/pet';
import { FOOD_ITEMS } from './data/items';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const INITIAL_PET_STATE: PetState = {
  name: 'Romeu',
  hunger: 70,
  happiness: 85,
  energy: 80,
  cleanliness: 80,
  isSleeping: false,
  coins: 50, // 50 moedinhas de presente de boas-vindas!
  inventory: {
    kibble: 4,
    meat_treat: 2,
    carrot: 2,
  },
  lastFed: new Date().toISOString(),
  lastPlayed: new Date().toISOString(),
  lastCleaned: new Date().toISOString(),
  lastSlept: new Date().toISOString(),
  lastActionBy: 'Sistema',
  lastActionText: 'Romeu está com o rabinho abanando de felicidade!',
};

export const App: React.FC = () => {
  const [pet, setPet] = useState<PetState>(() => {
    const saved = localStorage.getItem('salsicha_pet_state');
    if (!saved) return INITIAL_PET_STATE;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_PET_STATE,
        ...parsed,
        inventory: { ...INITIAL_PET_STATE.inventory, ...(parsed.inventory || {}) },
        coins: typeof parsed.coins === 'number' ? parsed.coins : 50,
      };
    } catch {
      return INITIAL_PET_STATE;
    }
  });

  const [currentRoom, setCurrentRoom] = useState<RoomType>('living');
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

    const fetchPet = async () => {
      const { data, error } = await client
        .from('pets')
        .select('*')
        .eq('id', 'primary_pet')
        .single();

      if (data && !error && data.state) {
        setPet((prev) => ({
          ...prev,
          ...data.state,
          inventory: { ...prev.inventory, ...(data.state.inventory || {}) },
          coins: typeof data.state.coins === 'number' ? data.state.coins : prev.coins,
        }));
        setIsConnected(true);
      }
    };

    fetchPet();

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

  // Carinho direto (única ação livre e imediata na Sala)
  const handlePet = async () => {
    const updated = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 12),
      lastActionBy: currentUser,
      lastActionText: `${currentUser} fez muito carinho na barriguinha 💖`,
    };
    triggerEffect('heart');
    if (updated.happiness >= 95) {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    }
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Alimentar escolhendo item do estoque na Cozinha
  const handleFeedItem = async (itemId: string) => {
    const currentQty = pet.inventory[itemId] || 0;
    if (currentQty <= 0) return;

    const itemDef = FOOD_ITEMS.find((f) => f.id === itemId);
    if (!itemDef) return;

    const updated: PetState = {
      ...pet,
      hunger: Math.min(100, pet.hunger + itemDef.hungerRestore),
      happiness: Math.min(100, pet.happiness + itemDef.happinessBonus),
      inventory: {
        ...pet.inventory,
        [itemId]: currentQty - 1,
      },
      lastActionBy: currentUser,
      lastActionText: `${currentUser} deu ${itemDef.name} ${itemDef.emoji} para o Romeu!`,
    };

    triggerEffect('food');
    confetti({ particleCount: 20, spread: 45 });
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Comprar item na Lojinha com Moedas
  const handleBuyItem = async (itemId: string, price: number) => {
    if (pet.coins < price) {
      alert('Moedas insuficientes! Joguem minigames para faturar moedas juntos 🎮');
      return;
    }

    const itemDef = FOOD_ITEMS.find((f) => f.id === itemId);
    const updated: PetState = {
      ...pet,
      coins: pet.coins - price,
      inventory: {
        ...pet.inventory,
        [itemId]: (pet.inventory[itemId] || 0) + 1,
      },
      lastActionBy: currentUser,
      lastActionText: `${currentUser} comprou ${itemDef?.name || 'comida'} no mercadinho! 🛍️`,
    };

    confetti({ particleCount: 25, spread: 50 });
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Ganhar moedas nos minigames
  const handleEarnCoins = async (amount: number) => {
    const updated: PetState = {
      ...pet,
      coins: pet.coins + amount,
      lastActionBy: currentUser,
      lastActionText: `${currentUser} jogou minigame e faturou +${amount} moedas! 🪙`,
    };
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Banho concluído no Banheiro
  const handleFinishBath = async () => {
    const updated: PetState = {
      ...pet,
      cleanliness: 100,
      happiness: Math.min(100, pet.happiness + 10),
      lastActionBy: currentUser,
      lastActionText: `${currentUser} deu um banho quentinho e perfumado 🛁🫧`,
    };
    triggerEffect('bath');
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Dormir / Acordar no Quarto
  const handleToggleSleep = async () => {
    const isSleepingNow = !pet.isSleeping;
    const updated: PetState = {
      ...pet,
      isSleeping: isSleepingNow,
      energy: isSleepingNow ? pet.energy : 100,
      lastActionBy: currentUser,
      lastActionText: isSleepingNow
        ? `${currentUser} apagou o abajur e pôs ${pet.name} para nanar 💤`
        : `${currentUser} acendeu o abajur e acordou ${pet.name} cheio de energia! ☀️`,
    };
    setPet(updated);
    await syncToSupabase(updated);
  };

  const getStatusColor = (val: number) => {
    if (val > 60) return 'bg-emerald-500';
    if (val > 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between max-w-md mx-auto transition-colors duration-700 ${
        pet.isSleeping
          ? 'bg-slate-900 text-slate-100'
          : 'bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 text-amber-950'
      } shadow-2xl relative select-none pb-2`}
    >
      {/* Top Bar / Header com Nome, Moedas e Conexão */}
      <header className="p-3 pt-5 flex items-center justify-between border-b border-amber-200/50 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-black tracking-tight">{pet.name}</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-800 border border-amber-400/30">
              Salsichinha 🐾
            </span>
          </div>
          <p className="text-[10px] opacity-75">Cuidado com amor por vocês dois</p>
        </div>

        {/* Saldo de Moedas & Status Online */}
        <div className="flex items-center gap-2">
          {/* Contador de Moedas */}
          <button
            onClick={() => setCurrentRoom('shop')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-xs shadow-xs hover:bg-amber-600 active:scale-95 transition-all"
          >
            <Coins size={14} className="text-amber-200" />
            <span>{pet.coins}</span>
          </button>

          {/* Status da Conexão */}
          <button
            onClick={() => setShowSyncModal(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold shadow-xs transition-all ${
              isConnected
                ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-400/40'
                : 'bg-amber-500/20 text-amber-800 border border-amber-400/40'
            }`}
          >
            {isConnected ? (
              <Wifi size={12} className="text-emerald-600" />
            ) : (
              <WifiOff size={12} className="text-amber-700" />
            )}
            <span>{isConnected ? 'Online' : 'Local'}</span>
          </button>
        </div>
      </header>

      {/* Alternador Rápido: Quem está jogando no momento? */}
      <div className="px-3 py-1.5 flex items-center justify-between text-xs bg-amber-200/30 backdrop-blur-xs border-b border-amber-300/30">
        <div className="flex items-center gap-1 font-semibold text-[11px] opacity-80">
          <UserCheck size={13} />
          <span>Jogando:</span>
        </div>
        <div className="flex bg-white/70 p-0.5 rounded-lg border border-amber-300/40 shadow-xs">
          <button
            onClick={() => setCurrentUser('Brenno')}
            className={`px-2.5 py-0.5 rounded-md font-bold text-xs transition-all ${
              currentUser === 'Brenno'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 opacity-60 hover:opacity-100'
            }`}
          >
            Brenno 👨‍💻
          </button>
          <button
            onClick={() => setCurrentUser('Meu Amor')}
            className={`px-2.5 py-0.5 rounded-md font-bold text-xs transition-all ${
              currentUser === 'Meu Amor'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-amber-900 opacity-60 hover:opacity-100'
            }`}
          >
            Meu Amor 💖
          </button>
        </div>
      </div>

      {/* Mini Barras de Status Vitais */}
      <div className="px-3 py-1.5 grid grid-cols-4 gap-1.5 text-[10px] font-bold">
        {/* Fome */}
        <div className="bg-white/80 p-1.5 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex justify-between mb-0.5">
            <span>🍖 Fome</span>
            <span>{pet.hunger}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getStatusColor(pet.hunger)}`}
              style={{ width: `${pet.hunger}%` }}
            />
          </div>
        </div>

        {/* Felicidade */}
        <div className="bg-white/80 p-1.5 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex justify-between mb-0.5">
            <span>💖 Amor</span>
            <span>{pet.happiness}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getStatusColor(pet.happiness)}`}
              style={{ width: `${pet.happiness}%` }}
            />
          </div>
        </div>

        {/* Energia */}
        <div className="bg-white/80 p-1.5 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex justify-between mb-0.5">
            <span>⚡ Sono</span>
            <span>{pet.energy}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getStatusColor(pet.energy)}`}
              style={{ width: `${pet.energy}%` }}
            />
          </div>
        </div>

        {/* Banho */}
        <div className="bg-white/80 p-1.5 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex justify-between mb-0.5">
            <span>🫧 Banho</span>
            <span>{pet.cleanliness}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getStatusColor(pet.cleanliness)}`}
              style={{ width: `${pet.cleanliness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo Central Dinâmico pelo Cômodo Atual */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 my-2 relative overflow-y-auto">
        {/* Cachorrinho visível nos cômodos da casa */}
        {currentRoom !== 'minigames' && currentRoom !== 'shop' && (
          <div className="w-full mb-2">
            <Dachshund
              isSleeping={pet.isSleeping}
              actionEffect={actionEffect}
              happiness={pet.happiness}
              onPet={handlePet}
            />
          </div>
        )}

        {/* Cômodo 1: Sala de Estar (Carinho e Relaxamento) */}
        {currentRoom === 'living' && (
          <div className="w-full flex flex-col items-center">
            {/* Banner da última ação */}
            <div className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-amber-200 shadow-xs text-center max-w-xs">
              <p className="text-xs font-semibold text-amber-950 flex items-center justify-center gap-1.5">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                <span>{pet.lastActionText}</span>
              </p>
            </div>

            {/* Dica de carinho */}
            <p className="text-[11px] text-amber-800/80 font-medium mt-3 text-center">
              Dê carinho tocando no cachorrinho ou explore os outros cômodos abaixo! 🐾
            </p>
          </div>
        )}

        {/* Cômodo 2: Cozinha (Estoque, Alimentação e Tigela) */}
        {currentRoom === 'kitchen' && (
          <Kitchen
            pet={pet}
            onFeedItem={handleFeedItem}
            onOpenShop={() => setCurrentRoom('shop')}
          />
        )}

        {/* Cômodo 3: Banheiro (Esponja e Chuveirinho) */}
        {currentRoom === 'bathroom' && (
          <Bathroom pet={pet} onFinishBath={handleFinishBath} />
        )}

        {/* Cômodo 4: Quarto (Abajur e Soneca) */}
        {currentRoom === 'bedroom' && (
          <Bedroom pet={pet} onToggleSleep={handleToggleSleep} />
        )}

        {/* Minigames do Casal */}
        {currentRoom === 'minigames' && (
          <MinigamesHub
            coins={pet.coins}
            onEarnCoins={handleEarnCoins}
            onBack={() => setCurrentRoom('living')}
          />
        )}

        {/* Loja / Mercadinho */}
        {currentRoom === 'shop' && (
          <Shop
            pet={pet}
            onBuyItem={handleBuyItem}
            onGoToMinigames={() => setCurrentRoom('minigames')}
            onBack={() => setCurrentRoom('kitchen')}
          />
        )}
      </main>

      {/* Barra de Navegação dos Cômodos e Minigames */}
      <nav className="px-3 pt-1">
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-3xl border border-amber-300 shadow-lg grid grid-cols-6 gap-1">
          {/* Sala */}
          <button
            onClick={() => setCurrentRoom('living')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              currentRoom === 'living'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-900 opacity-60 hover:opacity-100'
            }`}
          >
            <Home size={18} />
            <span className="text-[9px] font-bold mt-0.5">Sala</span>
          </button>

          {/* Cozinha */}
          <button
            onClick={() => setCurrentRoom('kitchen')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all relative ${
              currentRoom === 'kitchen'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-900 opacity-60 hover:opacity-100'
            }`}
          >
            <UtensilsCrossed size={18} />
            <span className="text-[9px] font-bold mt-0.5">Cozinha</span>
          </button>

          {/* Banho */}
          <button
            onClick={() => setCurrentRoom('bathroom')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              currentRoom === 'bathroom'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-900 opacity-60 hover:opacity-100'
            }`}
          >
            <Bath size={18} />
            <span className="text-[9px] font-bold mt-0.5">Banho</span>
          </button>

          {/* Quarto */}
          <button
            onClick={() => setCurrentRoom('bedroom')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              currentRoom === 'bedroom'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-900 opacity-60 hover:opacity-100'
            }`}
          >
            <Moon size={18} />
            <span className="text-[9px] font-bold mt-0.5">Quarto</span>
          </button>

          {/* Minigames */}
          <button
            onClick={() => setCurrentRoom('minigames')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              currentRoom === 'minigames'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-900 opacity-70 hover:opacity-100'
            }`}
          >
            <Gamepad2 size={18} />
            <span className="text-[9px] font-bold mt-0.5">Jogos</span>
          </button>

          {/* Loja */}
          <button
            onClick={() => setCurrentRoom('shop')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              currentRoom === 'shop'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-orange-900 opacity-70 hover:opacity-100'
            }`}
          >
            <ShoppingBag size={18} />
            <span className="text-[9px] font-bold mt-0.5">Loja</span>
          </button>
        </div>
      </nav>

      {/* Modal de Conexão Online */}
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
              Para você e sua namorada jogarem no mesmo cachorrinho em tempo real de celulares diferentes, basta conectar ao <strong>Supabase</strong> gratuito!
            </p>

            <div className="space-y-2 text-xs bg-amber-50 p-3 rounded-2xl border border-amber-200">
              <p className="font-semibold text-amber-900">Como ativar o multiplayer:</p>
              <ol className="list-decimal pl-4 space-y-1 text-amber-800">
                <li>Crie um projeto gratuito em <strong>supabase.com</strong>.</li>
                <li>Copie a <strong>Project URL</strong> e <strong>Anon Key</strong>.</li>
                <li>Adicione no arquivo <code>.env</code> do projeto ou na Vercel.</li>
              </ol>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSyncModal(false)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
              >
                Continuar Jogando!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
