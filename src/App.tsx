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

  // Estados do Chuveiro e Água
  const [isDraggingShower, setIsDraggingShower] = useState(false);
  const [showerCoords, setShowerCoords] = useState<{ x: number; y: number } | null>(null);

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
    setIsDraggingShower(false);
    setCurrentRoomIndex((prev) => (prev === 0 ? ROOMS.length - 1 : prev - 1));
  };

  const nextRoom = () => {
    setIsShopOpen(false);
    setIsMinigamesOpen(false);
    setIsHoveredByItem(false);
    setIsDraggingShower(false);
    setCurrentRoomIndex((prev) => (prev === ROOMS.length - 1 ? 0 : prev + 1));
  };

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

  const isPointOverDog = (point: { x: number; y: number }) => {
    const dogEl = document.getElementById('dog-target-zone');
    if (!dogEl) return false;
    const rect = dogEl.getBoundingClientRect();
    return (
      point.x >= rect.left - 30 &&
      point.x <= rect.right + 30 &&
      point.y >= rect.top - 30 &&
      point.y <= rect.bottom + 30
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

  // Alimentar
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
      lastActionText: `${currentUser} deu ${currentFood.name} para o Romeu!`,
    };

    triggerEffect('food');
    confetti({ particleCount: 25, spread: 45 });
    setPet(updated);
    await syncToSupabase(updated);
  };

  // Drag da comida
  const handleFoodDrag = (_: any, info: any) => {
    setIsHoveredByItem(isPointOverDog(info.point));
  };

  const handleFoodDragEnd = (_: any, info: any) => {
    setIsHoveredByItem(false);
    if (isPointOverDog(info.point)) {
      handleFeedFood();
    }
  };

  // Drag do Sabonete (Passa no cachorro e cria espuma de verdade!)
  const handleSoapDrag = (_: any, info: any) => {
    if (isPointOverDog(info.point)) {
      setIsHoveredByItem(true);
      setBubblesCount((prev) => Math.min(16, prev + 1));
    } else {
      setIsHoveredByItem(false);
    }
  };

  const handleSoapDragEnd = () => {
    setIsHoveredByItem(false);
  };

  // Drag do Chuveiro (Jorra água de verdade e lava a espuma!)
  const handleShowerDragStart = () => {
    setIsDraggingShower(true);
  };

  const handleShowerDrag = (_: any, info: any) => {
    setIsDraggingShower(true);
    setShowerCoords({ x: info.point.x, y: info.point.y });

    if (isPointOverDog(info.point)) {
      setIsHoveredByItem(true);
      setBubblesCount((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0 && bubblesCount > 0) {
          finishBath();
        }
        return next;
      });
    } else {
      setIsHoveredByItem(false);
    }
  };

  const handleShowerDragEnd = () => {
    setIsDraggingShower(false);
    setIsHoveredByItem(false);
    setShowerCoords(null);
  };

  const finishBath = async () => {
    const updated: PetState = {
      ...pet,
      cleanliness: 100,
      happiness: Math.min(100, pet.happiness + 15),
      lastActionBy: currentUser,
      lastActionText: `${currentUser} deu um banho bem cheiroso no Romeu 🚿🫧`,
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
      
      {/* ================= FUNDO DO CÔMODO ================= */}
      <RoomBackground room={currentRoom} isSleeping={pet.isSleeping} />

      {/* ================= BARRA SUPERIOR RETRÔ ESTILO POU ================= */}
      <header className="relative z-10 px-3 pt-3 pb-2 flex flex-col gap-2">
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

          {/* 4 Status Clássicos do Pou */}
          <div className="flex items-center gap-1.5">
            {/* Fome */}
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

            {/* Amor */}
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

            {/* Energia */}
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

            {/* Higiene */}
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

          {/* Jogador Ativo */}
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

        {/* Linha 2: Header de Navegação do Pou: < Cozinha > */}
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
        {/* Espumas de Sabão grudadas no corpo do Cachorrinho (Banheiro) */}
        {currentRoom === 'bathroom' && bubblesCount > 0 && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-25">
            <div className="relative w-64 h-36 flex flex-wrap justify-around items-center opacity-90">
              {Array.from({ length: bubblesCount }).map((_, i) => (
                <span
                  key={i}
                  className="text-3xl animate-bounce filter drop-shadow"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  🫧
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Jatos de Água Corrente que caem do Chuveiro */}
        {isDraggingShower && (
          <div
            className="fixed pointer-events-none z-50 flex flex-col items-center"
            style={{
              left: showerCoords ? `${showerCoords.x}px` : '50%',
              top: showerCoords ? `${showerCoords.y + 15}px` : '40%',
              transform: 'translateX(-50%)',
            }}
          >
            {/* Jatos de água animados descendo */}
            <div className="flex gap-2">
              <span className="text-xl animate-bounce text-sky-400">💧</span>
              <span className="text-2xl animate-pulse text-sky-300">💦</span>
              <span className="text-xl animate-bounce text-sky-400" style={{ animationDelay: '100ms' }}>💧</span>
            </div>
            <div className="w-12 h-24 bg-gradient-to-b from-sky-400/60 to-transparent blur-xs rounded-full transform scale-y-125" />
          </div>
        )}

        {/* Cachorrinho Salsicha */}
        <Dachshund
          isSleeping={pet.isSleeping}
          actionEffect={actionEffect}
          happiness={pet.happiness}
          isHoveredByItem={isHoveredByItem}
          onPet={handlePet}
        />
      </main>

      {/* ================= BARRA INFERIOR (OBJETOS VISUAIS PUROS SEM TEXTO) ================= */}
      <footer className="relative z-10 px-4 pb-4">
        
        {/* 1. COZINHA (Prateleira com a comidinha em si para arrastar) */}
        {currentRoom === 'kitchen' && (
          <div className="flex items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-3 py-2 rounded-3xl border-2 border-slate-800 shadow-lg">
            {/* Prateleira / Dispensa */}
            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center justify-center w-12 h-12 bg-amber-100 hover:bg-amber-200 rounded-2xl border-2 border-slate-800 shadow-xs active:scale-95 transition-transform"
            >
              <span className="text-2xl select-none">🥫</span>
            </button>

            {/* A comidinha visual em si (sem botões ou caixas de texto gigantes) */}
            <div className="flex-1 flex items-center justify-between px-2">
              <button
                onClick={() =>
                  setSelectedFoodIndex((prev) =>
                    prev === 0 ? FOOD_ITEMS.length - 1 : prev - 1
                  )
                }
                className="w-8 h-8 rounded-full bg-white/90 border border-slate-300 flex items-center justify-center active:scale-90 shadow-xs"
              >
                <ChevronLeft size={18} className="text-slate-700" strokeWidth={3} />
              </button>

              {/* Item de Comida Puro Arrastável */}
              <motion.div
                drag
                dragSnapToOrigin={true}
                whileDrag={{ scale: 1.4, zIndex: 60, cursor: 'grabbing' }}
                onDrag={handleFoodDrag}
                onDragEnd={handleFoodDragEnd}
                onClick={handleFeedFood}
                className="relative flex flex-col items-center cursor-grab touch-none p-2 active:scale-95"
              >
                <span className="text-4xl drop-shadow-md select-none">{currentFood.emoji}</span>
                {/* Badge de quantidade discreto */}
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-xs">
                  x{currentFoodStock}
                </span>
              </motion.div>

              <button
                onClick={() =>
                  setSelectedFoodIndex((prev) =>
                    prev === FOOD_ITEMS.length - 1 ? 0 : prev + 1
                  )
                }
                className="w-8 h-8 rounded-full bg-white/90 border border-slate-300 flex items-center justify-center active:scale-90 shadow-xs"
              >
                <ChevronRight size={18} className="text-slate-700" strokeWidth={3} />
              </button>
            </div>

            {/* Mercadinho */}
            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center justify-center w-12 h-12 bg-rose-100 hover:bg-rose-200 rounded-2xl border-2 border-slate-800 shadow-xs active:scale-95 transition-transform"
            >
              <span className="text-2xl select-none">🏪</span>
            </button>
          </div>
        )}

        {/* 2. BANHEIRO (Itens puros: Chuveiro real e Sabonete 3D do Pou!) */}
        {currentRoom === 'bathroom' && (
          <div className="flex items-center justify-around gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-3xl border-2 border-slate-800 shadow-lg">
            {/* O Chuveiro Real Arrastável (Como no Pou) */}
            <motion.div
              drag
              dragSnapToOrigin={true}
              whileDrag={{ scale: 1.25, zIndex: 60, cursor: 'grabbing' }}
              onDragStart={handleShowerDragStart}
              onDrag={handleShowerDrag}
              onDragEnd={handleShowerDragEnd}
              className="cursor-grab touch-none flex items-center justify-center p-1 active:scale-95"
            >
              {/* Ilustração SVG de Chuveirinho Real com Água */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  {/* Cabo do chuveiro */}
                  <path
                    d="M 25 85 Q 28 35 62 25 L 75 35"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  {/* Cabeça do chuveiro */}
                  <ellipse
                    cx="74"
                    cy="38"
                    rx="16"
                    ry="9"
                    fill="#d97706"
                    transform="rotate(35 74 38)"
                  />
                  <ellipse
                    cx="75"
                    cy="39"
                    rx="14"
                    ry="7"
                    fill="#fef08a"
                    transform="rotate(35 75 39)"
                  />
                  {/* Furos do chuveiro */}
                  <circle cx="72" cy="38" r="1.5" fill="#78350f" />
                  <circle cx="76" cy="40" r="1.5" fill="#78350f" />
                  <circle cx="78" cy="37" r="1.5" fill="#78350f" />
                </svg>
              </div>
            </motion.div>

            {/* O Sabonete 3D Puro Arrastável (Idêntico ao Pou!) */}
            <motion.div
              drag
              dragSnapToOrigin={true}
              whileDrag={{ scale: 1.35, zIndex: 60, cursor: 'grabbing' }}
              onDrag={handleSoapDrag}
              onDragEnd={handleSoapDragEnd}
              className="cursor-grab touch-none flex items-center justify-center p-1 active:scale-95"
            >
              {/* Barra de Sabonete 3D estilizada como no Pou */}
              <div className="relative w-16 h-12 flex items-center justify-center">
                <svg viewBox="0 0 100 65" className="w-full h-full drop-shadow-md">
                  {/* Corpo do Sabonete azul com relevo */}
                  <rect x="5" y="10" width="90" height="48" rx="24" fill="#0284c7" />
                  <rect x="8" y="8" width="84" height="44" rx="22" fill="#38bdf8" />
                  {/* Brilho superior */}
                  <ellipse cx="50" cy="20" rx="36" ry="9" fill="#7dd3fc" opacity="0.8" />
                  <ellipse cx="38" cy="17" rx="14" ry="4" fill="#ffffff" opacity="0.8" />
                  {/* Gravação da palavra SOAP no sabonete */}
                  <text
                    x="50"
                    y="36"
                    fontSize="11"
                    fontWeight="900"
                    fill="#0369a1"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    SOAP
                  </text>
                  {/* Pequenas bolhas presas ao sabonete */}
                  <circle cx="82" cy="15" r="5" fill="#ffffff" opacity="0.8" />
                  <circle cx="87" cy="20" r="3.5" fill="#ffffff" opacity="0.9" />
                </svg>
              </div>
            </motion.div>

            {/* Loja */}
            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center justify-center w-12 h-12 bg-rose-100 hover:bg-rose-200 rounded-2xl border-2 border-slate-800 shadow-xs active:scale-95 transition-transform"
            >
              <span className="text-2xl select-none">🏪</span>
            </button>
          </div>
        )}

        {/* 3. QUARTO (Abajur Puro que Acende / Apaga) */}
        {currentRoom === 'bedroom' && (
          <div className="flex items-center justify-around gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-3xl border-2 border-slate-800 shadow-lg">
            <button
              onClick={handleToggleSleep}
              className={`flex items-center justify-center w-16 h-14 rounded-2xl border-2 border-slate-800 shadow-md active:scale-95 transition-all ${
                pet.isSleeping
                  ? 'bg-amber-400 text-slate-900 animate-pulse'
                  : 'bg-indigo-900 text-white'
              }`}
            >
              <span className="text-3xl select-none">{pet.isSleeping ? '☀️' : '💡'}</span>
            </button>

            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center justify-center w-12 h-12 bg-rose-100 hover:bg-rose-200 rounded-2xl border-2 border-slate-800 shadow-xs active:scale-95 transition-transform"
            >
              <span className="text-2xl select-none">🏪</span>
            </button>
          </div>
        )}

        {/* 4. JARDIM (Controle de Jogos) */}
        {currentRoom === 'garden' && (
          <div className="flex items-center justify-around gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-3xl border-2 border-slate-800 shadow-lg">
            <button
              onClick={() => setIsMinigamesOpen(true)}
              className="flex items-center justify-center gap-2 flex-1 h-14 bg-purple-600 hover:bg-purple-700 rounded-2xl border-2 border-slate-800 shadow-xs active:scale-95 text-white font-black text-sm"
            >
              <span className="text-2xl select-none">🎮</span>
              <span>Minigames</span>
            </button>

            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center justify-center w-12 h-12 bg-rose-100 hover:bg-rose-200 rounded-2xl border-2 border-slate-800 shadow-xs active:scale-95 transition-transform"
            >
              <span className="text-2xl select-none">🏪</span>
            </button>
          </div>
        )}

        {/* 5. SALA (Bolinha Pura de Tênis para Arrastar) */}
        {currentRoom === 'living' && (
          <div className="flex items-center justify-around gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-3xl border-2 border-slate-800 shadow-lg">
            <motion.div
              drag
              dragSnapToOrigin={true}
              whileDrag={{ scale: 1.35, zIndex: 60, cursor: 'grabbing' }}
              onDrag={(_: any, info: any) => setIsHoveredByItem(isPointOverDog(info.point))}
              onDragEnd={(_: any, info: any) => {
                setIsHoveredByItem(false);
                if (isPointOverDog(info.point)) {
                  handlePet();
                }
              }}
              onClick={handlePet}
              className="cursor-grab touch-none flex items-center justify-center p-2 active:scale-95"
            >
              <span className="text-4xl drop-shadow-md select-none">🎾</span>
            </motion.div>

            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center justify-center w-12 h-12 bg-rose-100 hover:bg-rose-200 rounded-2xl border-2 border-slate-800 shadow-xs active:scale-95 transition-transform"
            >
              <span className="text-2xl select-none">🏪</span>
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
