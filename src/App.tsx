import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Wifi,
  WifiOff,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Dachshund } from './components/Dachshund';
import { RoomBackground } from './components/Rooms/RoomBackground';
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
  cleanliness: 75,
  isSleeping: false,
  coins: 60,
  inventory: {
    kibble: 4,
    meat_treat: 2,
    big_bone: 1,
    carrot: 2,
  },
  lastFed: new Date().toISOString(),
  lastPlayed: new Date().toISOString(),
  lastCleaned: new Date().toISOString(),
  lastSlept: new Date().toISOString(),
  lastActionBy: 'Sistema',
  lastActionText: 'Romeu está super feliz em ver vocês dois!',
};

const ROOMS: { id: RoomType; name: string }[] = [
  { id: 'kitchen', name: 'Cozinha' },
  { id: 'bathroom', name: 'Banheiro' },
  { id: 'bedroom', name: 'Quarto' },
  { id: 'living', name: 'Sala' },
  { id: 'garden', name: 'Jardim' },
];

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
        coins: typeof parsed.coins === 'number' ? parsed.coins : 60,
      };
    } catch {
      return INITIAL_PET_STATE;
    }
  });

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMinigamesOpen, setIsMinigamesOpen] = useState(false);

  const [selectedFoodIndex, setSelectedFoodIndex] = useState(0);
  const [bubblesCount, setBubblesCount] = useState(0);
  const [isHoveredByItem, setIsHoveredByItem] = useState(false);
  const [isWaterSpraying, setIsWaterSpraying] = useState(false);

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('salsicha_pet_user') || 'Brenno';
  });

  const [actionEffect, setActionEffect] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isConnected, setIsConnected] = useState(isSupabaseConfigured);

  const currentRoom = ROOMS[currentRoomIndex].id;

  const prevRoom = () => {
    setIsShopOpen(false);
    setIsMinigamesOpen(false);
    setIsHoveredByItem(false);
    setCurrentRoomIndex((prev) => (prev === 0 ? ROOMS.length - 1 : prev - 1));
  };

  const nextRoom = () => {
    setIsShopOpen(false);
    setIsMinigamesOpen(false);
    setIsHoveredByItem(false);
    setCurrentRoomIndex((prev) => (prev === ROOMS.length - 1 ? 0 : prev + 1));
  };

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('salsicha_pet_state', JSON.stringify(pet));
  }, [pet]);

  useEffect(() => {
    localStorage.setItem('salsicha_pet_user', currentUser);
  }, [currentUser]);

  // Conexão em tempo real com Supabase
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

  // Checar colisão do item arrastado com o cachorrinho
  const isPointOverDog = (point: { x: number; y: number }) => {
    const dogEl = document.getElementById('dog-target-zone');
    if (!dogEl) return false;
    const rect = dogEl.getBoundingClientRect();
    return (
      point.x >= rect.left - 25 &&
      point.x <= rect.right + 25 &&
      point.y >= rect.top - 25 &&
      point.y <= rect.bottom + 25
    );
  };

  // Fazer Carinho
  const handlePet = async () => {
    const updated = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 10),
      lastActionBy: currentUser,
      lastActionText: `${currentUser} fez carinho no Romeu 💖`,
    };
    triggerEffect('heart');
    if (updated.happiness >= 95) {
      confetti({ particleCount: 30, spread: 60 });
    }
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Alimentar (Arrastando ou Clicando)
  const currentFood = FOOD_ITEMS[selectedFoodIndex];
  const currentFoodStock = pet.inventory[currentFood.id] || 0;

  const handleFeedFood = async () => {
    if (currentFoodStock <= 0) {
      setIsShopOpen(true);
      return;
    }
    if (pet.hunger >= 100) {
      alert(`${pet.name} já está empanturrado! 😋`);
      return;
    }

    const updated: PetState = {
      ...pet,
      hunger: Math.min(100, pet.hunger + currentFood.hungerRestore),
      happiness: Math.min(100, pet.happiness + currentFood.happinessBonus),
      inventory: {
        ...pet.inventory,
        [currentFood.id]: currentFoodStock - 1,
      },
      lastActionBy: currentUser,
      lastActionText: `${currentUser} deu ${currentFood.name} ${currentFood.emoji} para o Romeu!`,
    };

    triggerEffect('food');
    confetti({ particleCount: 25, spread: 45 });
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Arrastando a comida até o cachorrinho
  const handleFoodDrag = (_: any, info: any) => {
    const hovering = isPointOverDog(info.point);
    setIsHoveredByItem(hovering);
  };

  const handleFoodDragEnd = (_: any, info: any) => {
    setIsHoveredByItem(false);
    if (isPointOverDog(info.point)) {
      handleFeedFood();
    }
  };

  // Arrastando o sabonete pelo corpo do salsicha (cria espumas conforme passa nele!)
  const handleSoapDrag = (_: any, info: any) => {
    if (isPointOverDog(info.point)) {
      setIsHoveredByItem(true);
      setBubblesCount((prev) => Math.min(14, prev + 1));
    } else {
      setIsHoveredByItem(false);
    }
  };

  const handleSoapDragEnd = () => {
    setIsHoveredByItem(false);
  };

  // Arrastando o chuveirinho com água jorrando (lava as espumas!)
  const handleShowerDrag = (_: any, info: any) => {
    if (isPointOverDog(info.point)) {
      setIsWaterSpraying(true);
      setIsHoveredByItem(true);
      setBubblesCount((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0 && bubblesCount > 0) {
          finishBath();
        }
        return next;
      });
    } else {
      setIsWaterSpraying(false);
      setIsHoveredByItem(false);
    }
  };

  const handleShowerDragEnd = () => {
    setIsWaterSpraying(false);
    setIsHoveredByItem(false);
  };

  const finishBath = async () => {
    const updated: PetState = {
      ...pet,
      cleanliness: 100,
      happiness: Math.min(100, pet.happiness + 15),
      lastActionBy: currentUser,
      lastActionText: `${currentUser} ensaboou e deu banho gostoso no Romeu 🚿🫧`,
    };
    triggerEffect('bath');
    confetti({ particleCount: 35, spread: 55 });
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Quarto (Abajur estilo Pou)
  const handleToggleSleep = async () => {
    const isSleepingNow = !pet.isSleeping;
    const updated: PetState = {
      ...pet,
      isSleeping: isSleepingNow,
      energy: isSleepingNow ? pet.energy : 100,
      lastActionBy: currentUser,
      lastActionText: isSleepingNow
        ? `${currentUser} apagou o abajur para o Romeu dormir 💤`
        : `${currentUser} acendeu o abajur e acordou o Romeu! ☀️`,
    };
    if (!isSleepingNow) {
      confetti({ particleCount: 30, spread: 60 });
    }
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Loja
  const handleBuyItem = async (itemId: string, price: number) => {
    if (pet.coins < price) {
      alert('Moedas insuficientes! Joguem minigames para faturar moedas 🎮');
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
      lastActionText: `${currentUser} comprou ${itemDef?.name || 'comida'} no mercadinho 🛍️`,
    };
    confetti({ particleCount: 20, spread: 45 });
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Ganhar moedas nos minigames
  const handleEarnCoins = async (amount: number) => {
    const updated: PetState = {
      ...pet,
      coins: pet.coins + amount,
      lastActionBy: currentUser,
      lastActionText: `${currentUser} faturou +${amount} moedas no minigame! 🪙`,
    };
    setPet(updated);
    await syncToSupabase(updated);
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto flex flex-col justify-between relative select-none overflow-hidden font-sans border-x border-slate-300 shadow-2xl bg-amber-50">
      
      {/* ================= FUNDO DO CÔMODO ATUAL ================= */}
      <RoomBackground room={currentRoom} isSleeping={pet.isSleeping} />

      {/* ================= BARRA SUPERIOR RETRÔ ESTILO POU ================= */}
      <header className="relative z-10 px-3 pt-3 pb-2 flex flex-col gap-2">
        {/* Linha 1: Moedas + Status Clássicos em Quadradinhos do Pou */}
        <div className="flex items-center justify-between gap-1.5">
          {/* Moedas */}
          <button
            onClick={() => setIsShopOpen(true)}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 active:scale-95 px-2.5 py-1 rounded-xl border-2 border-amber-600 shadow-md text-amber-950 font-black text-xs transition-transform"
          >
            <div className="w-5 h-5 rounded-full bg-yellow-300 border border-amber-600 flex items-center justify-center text-[10px] font-black shadow-inner">
              $
            </div>
            <span>{pet.coins}</span>
            <span className="text-[10px] bg-emerald-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
              +
            </span>
          </button>

          {/* 4 Status em Quadradinhos com Borda Grossa do Pou */}
          <div className="flex items-center gap-1.5">
            {/* Fome 🍗 */}
            <div className="w-9 h-9 bg-white rounded-xl border-2 border-slate-800 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-xs z-10">🍗</span>
              <div
                className="absolute bottom-0 w-full bg-amber-500 transition-all duration-300"
                style={{ height: `${pet.hunger}%`, opacity: 0.35 }}
              />
              <span className="text-[8px] font-black z-10 text-slate-900 leading-none">
                {pet.hunger}%
              </span>
            </div>

            {/* Amor / Felicidade 💖 */}
            <div className="w-9 h-9 bg-white rounded-xl border-2 border-slate-800 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-xs z-10">💖</span>
              <div
                className="absolute bottom-0 w-full bg-rose-500 transition-all duration-300"
                style={{ height: `${pet.happiness}%`, opacity: 0.35 }}
              />
              <span className="text-[8px] font-black z-10 text-slate-900 leading-none">
                {pet.happiness}%
              </span>
            </div>

            {/* Energia ⚡ */}
            <div className="w-9 h-9 bg-white rounded-xl border-2 border-slate-800 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-xs z-10">⚡</span>
              <div
                className="absolute bottom-0 w-full bg-cyan-500 transition-all duration-300"
                style={{ height: `${pet.energy}%`, opacity: 0.35 }}
              />
              <span className="text-[8px] font-black z-10 text-slate-900 leading-none">
                {pet.energy}%
              </span>
            </div>

            {/* Higiene 🫧 */}
            <div className="w-9 h-9 bg-white rounded-xl border-2 border-slate-800 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-xs z-10">🫧</span>
              <div
                className="absolute bottom-0 w-full bg-sky-500 transition-all duration-300"
                style={{ height: `${pet.cleanliness}%`, opacity: 0.35 }}
              />
              <span className="text-[8px] font-black z-10 text-slate-900 leading-none">
                {pet.cleanliness}%
              </span>
            </div>
          </div>

          {/* Jogador Ativo (Casal) */}
          <div className="flex bg-white/90 p-0.5 rounded-xl border-2 border-slate-800 shadow-md">
            <button
              onClick={() => setCurrentUser((u) => (u === 'Brenno' ? 'Meu Amor' : 'Brenno'))}
              className="px-2 py-1 rounded-lg font-black text-[10px] bg-rose-500 text-white flex items-center gap-1 active:scale-95 transition-all"
            >
              <UserCheck size={11} />
              <span>{currentUser === 'Brenno' ? 'Brenno' : 'Amor'}</span>
            </button>
          </div>
        </div>

        {/* Linha 2: Header de Navegação de Cômodo do Pou: < Cozinha > */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSyncModal(true)}
            className="w-8 h-8 rounded-xl bg-white border-2 border-slate-800 shadow-md flex items-center justify-center active:scale-95"
            title="Conexão Online"
          >
            {isConnected ? (
              <Wifi size={16} className="text-emerald-600" />
            ) : (
              <WifiOff size={16} className="text-amber-600" />
            )}
          </button>

          {/* Seletor Central */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevRoom}
              className="w-8 h-8 rounded-xl bg-white border-2 border-slate-800 shadow-md flex items-center justify-center active:scale-95 hover:bg-slate-100 transition-all"
            >
              <ChevronLeft size={22} className="text-slate-800" strokeWidth={3} />
            </button>

            <div className="bg-white px-4 py-1 rounded-xl border-2 border-slate-800 shadow-md min-w-[120px] text-center">
              <span className="font-black text-sm text-slate-800 tracking-wide uppercase">
                {ROOMS[currentRoomIndex].name}
              </span>
            </div>

            <button
              onClick={nextRoom}
              className="w-8 h-8 rounded-xl bg-white border-2 border-slate-800 shadow-md flex items-center justify-center active:scale-95 hover:bg-slate-100 transition-all"
            >
              <ChevronRight size={22} className="text-slate-800" strokeWidth={3} />
            </button>
          </div>

          {/* Botão de Loja rápida */}
          <button
            onClick={() => setIsShopOpen(true)}
            className="w-8 h-8 rounded-xl bg-white border-2 border-slate-800 shadow-md flex items-center justify-center active:scale-95"
            title="Loja"
          >
            <ShoppingBag size={16} className="text-rose-600" />
          </button>
        </div>
      </header>

      {/* ================= CORPO CENTRAL COM O SALSICHINHA ================= */}
      <main className="flex-1 relative flex flex-col justify-center items-center z-10 px-4">
        {/* Espumas de Sabão no Cachorrinho (Banheiro) */}
        {currentRoom === 'bathroom' && bubblesCount > 0 && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-25">
            <div className="relative w-64 h-48 flex flex-wrap justify-around items-center opacity-90">
              {Array.from({ length: bubblesCount }).map((_, i) => (
                <span
                  key={i}
                  className="text-3xl animate-bounce"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  🫧
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Jatos de Água do Chuveirinho */}
        {isWaterSpraying && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-30">
            <div className="text-4xl animate-pulse">💦💦💦</div>
          </div>
        )}

        {/* Cachorrinho Salsicha Animado */}
        <Dachshund
          isSleeping={pet.isSleeping}
          actionEffect={actionEffect}
          happiness={pet.happiness}
          isHoveredByItem={isHoveredByItem}
          onPet={handlePet}
        />

        {/* Notificaçãozinha de ação */}
        <div className="mt-2 px-3 py-1 bg-white/90 rounded-full border-2 border-slate-800 shadow-md text-center max-w-[280px]">
          <p className="text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1">
            <Sparkles size={12} className="text-amber-500 shrink-0" />
            <span className="truncate">{pet.lastActionText}</span>
          </p>
        </div>
      </main>

      {/* ================= BARRA INFERIOR INTERATIVA E ARRASTÁVEL ================= */}
      <footer className="relative z-10 px-4 pb-4">
        
        {/* 1. COZINHA (Prateleira com item arrastável até a boca do cachorro!) */}
        {currentRoom === 'kitchen' && (
          <div className="flex items-center justify-between gap-2 bg-white/95 p-2 rounded-2xl border-2 border-slate-800 shadow-lg">
            <button
              onClick={() => setIsShopOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 bg-amber-100 rounded-xl border-2 border-slate-800 shadow-xs active:scale-95"
            >
              <span className="text-xl">🥫</span>
              <span className="text-[9px] font-black text-slate-800">Dispensa</span>
            </button>

            {/* Área da Comida Arrastável */}
            <div className="flex-1 flex items-center justify-between bg-amber-50 px-2 py-1 rounded-xl border-2 border-amber-300 relative">
              <button
                onClick={() =>
                  setSelectedFoodIndex((prev) =>
                    prev === 0 ? FOOD_ITEMS.length - 1 : prev - 1
                  )
                }
                className="p-1 rounded-lg hover:bg-amber-200 active:scale-90"
              >
                <ChevronLeft size={20} className="text-slate-800" strokeWidth={3} />
              </button>

              {/* Item de Comida Arrastável com Framer Motion */}
              <motion.div
                drag
                dragSnapToOrigin={true}
                whileDrag={{ scale: 1.35, zIndex: 60, cursor: 'grabbing' }}
                onDrag={handleFoodDrag}
                onDragEnd={handleFoodDragEnd}
                onClick={handleFeedFood}
                className="flex flex-col items-center cursor-grab touch-none p-1 rounded-xl hover:bg-amber-100 active:scale-95 transition-transform"
              >
                <span className="text-3xl drop-shadow-md select-none">{currentFood.emoji}</span>
                <span className="text-[10px] font-black text-slate-800 leading-tight">
                  {currentFood.name}
                </span>
                <span
                  className={`text-[8px] font-black px-1.5 py-0.2 rounded-full ${
                    currentFoodStock > 0
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {currentFoodStock > 0 ? `Arraste! (x${currentFoodStock})` : 'Comprar na Loja'}
                </span>
              </motion.div>

              <button
                onClick={() =>
                  setSelectedFoodIndex((prev) =>
                    prev === FOOD_ITEMS.length - 1 ? 0 : prev + 1
                  )
                }
                className="p-1 rounded-lg hover:bg-amber-200 active:scale-90"
              >
                <ChevronRight size={20} className="text-slate-800" strokeWidth={3} />
              </button>
            </div>

            <button
              onClick={() => setIsShopOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 bg-rose-100 rounded-xl border-2 border-slate-800 shadow-xs active:scale-95"
            >
              <span className="text-xl">🏪</span>
              <span className="text-[9px] font-black text-slate-800">Loja</span>
            </button>
          </div>
        )}

        {/* 2. BANHEIRO (Sabonete arrastável que faz espuma e Chuveiro arrastável que enxagua!) */}
        {currentRoom === 'bathroom' && (
          <div className="flex items-center justify-around gap-2 bg-white/95 p-2 rounded-2xl border-2 border-slate-800 shadow-lg">
            {/* Chuveirinho Arrastável */}
            <motion.div
              drag
              dragSnapToOrigin={true}
              whileDrag={{ scale: 1.3, zIndex: 60, cursor: 'grabbing' }}
              onDrag={handleShowerDrag}
              onDragEnd={handleShowerDragEnd}
              className="flex flex-col items-center justify-center flex-1 h-14 bg-sky-100 hover:bg-sky-200 rounded-xl border-2 border-slate-800 shadow-xs cursor-grab touch-none"
            >
              <span className="text-2xl select-none">🚿</span>
              <span className="text-[9px] font-black text-slate-800">Arraste p/ Enxaguar</span>
            </motion.div>

            {/* Sabonete Azul Arrastável do Pou */}
            <motion.div
              drag
              dragSnapToOrigin={true}
              whileDrag={{ scale: 1.35, zIndex: 60, cursor: 'grabbing' }}
              onDrag={handleSoapDrag}
              onDragEnd={handleSoapDragEnd}
              className="flex flex-col items-center justify-center flex-1 h-14 bg-blue-500 hover:bg-blue-600 rounded-xl border-2 border-slate-800 shadow-xs cursor-grab touch-none text-white"
            >
              <span className="text-2xl select-none">🧼</span>
              <span className="text-[9px] font-black">
                {bubblesCount >= 10 ? '✨ Pronto p/ Chuveiro!' : 'Arraste no Romeu!'}
              </span>
            </motion.div>

            <button
              onClick={() => setIsShopOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 bg-rose-100 rounded-xl border-2 border-slate-800 shadow-xs active:scale-95"
            >
              <span className="text-xl">🏪</span>
              <span className="text-[9px] font-black text-slate-800">Loja</span>
            </button>
          </div>
        )}

        {/* 3. QUARTO (Abajur interativo do Pou) */}
        {currentRoom === 'bedroom' && (
          <div className="flex items-center justify-around gap-3 bg-white/95 p-2 rounded-2xl border-2 border-slate-800 shadow-lg">
            <button
              onClick={handleToggleSleep}
              className={`flex items-center justify-center gap-2 flex-1 h-14 rounded-xl border-2 border-slate-800 shadow-xs active:scale-95 transition-all font-black text-xs ${
                pet.isSleeping
                  ? 'bg-amber-400 text-slate-900 animate-pulse'
                  : 'bg-indigo-900 text-white'
              }`}
            >
              <span className="text-2xl">{pet.isSleeping ? '☀️' : '💡'}</span>
              <span>{pet.isSleeping ? 'Acender Abajur (Acordar)' : 'Apagar Abajur (Dormir)'}</span>
            </button>

            <button
              onClick={() => setIsShopOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 bg-rose-100 rounded-xl border-2 border-slate-800 shadow-xs active:scale-95"
            >
              <span className="text-xl">🏪</span>
              <span className="text-[9px] font-black text-slate-800">Loja</span>
            </button>
          </div>
        )}

        {/* 4. JARDIM (Minigames) */}
        {currentRoom === 'garden' && (
          <div className="flex items-center justify-around gap-2 bg-white/95 p-2 rounded-2xl border-2 border-slate-800 shadow-lg">
            <button
              onClick={() => setIsMinigamesOpen(true)}
              className="flex items-center justify-center gap-2 flex-1 h-14 bg-purple-600 hover:bg-purple-700 rounded-xl border-2 border-slate-800 shadow-xs active:scale-95 text-white font-black text-xs"
            >
              <span className="text-2xl">🎮</span>
              <span>Jogar Minigames (4 Jogos)</span>
            </button>

            <button
              onClick={() => setIsShopOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 bg-rose-100 rounded-xl border-2 border-slate-800 shadow-xs active:scale-95"
            >
              <span className="text-xl">🏪</span>
              <span className="text-[9px] font-black text-slate-800">Loja</span>
            </button>
          </div>
        )}

        {/* 5. SALA (Bolinha arrastável para brincar ou Carinho) */}
        {currentRoom === 'living' && (
          <div className="flex items-center justify-around gap-2 bg-white/95 p-2 rounded-2xl border-2 border-slate-800 shadow-lg">
            {/* Bolinha arrastável de tênis */}
            <motion.div
              drag
              dragSnapToOrigin={true}
              whileDrag={{ scale: 1.3, zIndex: 60, cursor: 'grabbing' }}
              onDrag={(_: any, info: any) => setIsHoveredByItem(isPointOverDog(info.point))}
              onDragEnd={(_: any, info: any) => {
                setIsHoveredByItem(false);
                if (isPointOverDog(info.point)) {
                  handlePet();
                }
              }}
              onClick={handlePet}
              className="flex items-center justify-center gap-2 flex-1 h-14 bg-rose-500 hover:bg-rose-600 rounded-xl border-2 border-slate-800 shadow-xs cursor-grab touch-none text-white font-black text-xs"
            >
              <span className="text-2xl select-none">🎾</span>
              <span>Arraste a Bolinha ou Carinho!</span>
            </motion.div>

            <button
              onClick={() => setIsShopOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 bg-rose-100 rounded-xl border-2 border-slate-800 shadow-xs active:scale-95"
            >
              <span className="text-xl">🏪</span>
              <span className="text-[9px] font-black text-slate-800">Loja</span>
            </button>
          </div>
        )}
      </footer>

      {/* ================= MODAIS ================= */}
      {isShopOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full max-h-[85vh] overflow-y-auto border-4 border-slate-800 shadow-2xl">
            <Shop
              pet={pet}
              onBuyItem={handleBuyItem}
              onGoToMinigames={() => {
                setIsShopOpen(false);
                setIsMinigamesOpen(true);
              }}
              onBack={() => setIsShopOpen(false)}
            />
          </div>
        </div>
      )}

      {isMinigamesOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full max-h-[90vh] overflow-y-auto border-4 border-slate-800 shadow-2xl">
            <MinigamesHub
              coins={pet.coins}
              onEarnCoins={handleEarnCoins}
              onBack={() => setIsMinigamesOpen(false)}
            />
          </div>
        </div>
      )}

      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border-4 border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Wifi className="text-amber-500" size={20} />
                <h3 className="font-black text-base">Modo Conectado 🐾</h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para você e sua namorada jogarem no mesmo cachorrinho em tempo real de celulares diferentes, conectamos com o <strong>Supabase</strong> gratuito!
            </p>

            <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <p className="font-black">Passo a passo rápido:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Crie projeto no <strong>supabase.com</strong>.</li>
                <li>Rode o script <code>supabase_schema.sql</code>.</li>
                <li>Coloque as chaves no <code>.env</code>.</li>
              </ol>
            </div>

            <button
              onClick={() => setShowSyncModal(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black rounded-xl text-xs shadow-md"
            >
              Continuar Jogando!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
