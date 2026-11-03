import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ArrowLeft, RotateCcw, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CatchTreatsGameProps {
  onEarnCoins: (coins: number) => void;
  onBack: () => void;
}

interface FallingItem {
  id: number;
  x: number; // 5% a 95%
  y: number; // 0% a 100%
  type: 'bone' | 'meat' | 'cake' | 'sock';
  emoji: string;
  points: number;
  speed: number;
}

export const CatchTreatsGame: React.FC<CatchTreatsGameProps> = ({ onEarnCoins, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [dogPositionX, setDogPositionX] = useState(50); // porcentagem de 10 a 90%
  const [items, setItems] = useState<FallingItem[]>([]);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const nextItemIdRef = useRef(1);

  // Iniciar jogo
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    setIsGameOver(false);
    setIsPlaying(true);
    setDogPositionX(50);
  };

  // Timer do jogo
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver]);

  // Finalizar jogo e conceder moedas
  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    // Moedas proporcionais aos pontos (pelo menos 5 moedas de consolação)
    const earned = Math.max(5, Math.floor(score / 5));
    onEarnCoins(earned);
    confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
  };

  // Loop de física dos itens caindo
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    let lastSpawn = Date.now();

    const loop = () => {
      const now = Date.now();

      // Gerar novo item a cada 650ms
      if (now - lastSpawn > 650) {
        lastSpawn = now;
        const rand = Math.random();
        let type: FallingItem['type'] = 'bone';
        let emoji = '🦴';
        let points = 10;
        let speed = 1.2 + Math.random() * 0.8;

        if (rand > 0.85) {
          type = 'cake';
          emoji = '🧁';
          points = 30;
          speed = 1.5;
        } else if (rand > 0.6) {
          type = 'meat';
          emoji = '🥩';
          points = 20;
          speed = 1.3;
        } else if (rand < 0.2) {
          type = 'sock';
          emoji = '🧦';
          points = -15;
          speed = 1.1;
        }

        const newItem: FallingItem = {
          id: nextItemIdRef.current++,
          x: Math.floor(Math.random() * 80) + 10,
          y: 0,
          type,
          emoji,
          points,
          speed,
        };

        setItems((prev) => [...prev, newItem]);
      }

      // Atualizar posições e verificar colisão com o salsicha
      setItems((prevItems) => {
        const nextItems: FallingItem[] = [];

        for (const item of prevItems) {
          const newY = item.y + item.speed * 1.3;

          // Colisão perto do chão (y entre 80 e 92%)
          if (newY >= 80 && newY <= 92) {
            const distance = Math.abs(item.x - dogPositionX);
            if (distance < 14) {
              // Pegou o item!
              setScore((s) => Math.max(0, s + item.points));
              continue; // remove o item
            }
          }

          // Se ainda não caiu no chão, mantém
          if (newY < 98) {
            nextItems.push({ ...item, y: newY });
          }
        }

        return nextItems;
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, dogPositionX, score]);

  // Controle por toque / arraste no celular
  const handleTouch = (clientX: number) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.min(88, Math.max(12, relativeX));
    setDogPositionX(clampedX);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Topo com Voltar e Pontuação */}
      <div className="flex items-center justify-between bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
            ⏳ {timeLeft}s
          </span>
          <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-300">
            ⭐ {score} pts
          </span>
        </div>
      </div>

      {/* Área do Jogo */}
      <div
        ref={gameAreaRef}
        onTouchMove={(e) => handleTouch(e.touches[0].clientX)}
        onTouchStart={(e) => handleTouch(e.touches[0].clientX)}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleTouch(e.clientX);
        }}
        className="relative w-full h-[360px] bg-gradient-to-b from-sky-200 via-amber-50 to-emerald-200 rounded-3xl border-2 border-amber-300 shadow-inner overflow-hidden select-none touch-none"
      >
        {/* Nuvens decorativas */}
        <div className="absolute top-4 left-6 text-2xl opacity-60">☁️</div>
        <div className="absolute top-8 right-8 text-xl opacity-60">☁️</div>

        {/* Graminha no chão */}
        <div className="absolute bottom-0 w-full h-8 bg-emerald-500/70 border-t-2 border-emerald-600" />

        {/* Tela Inicial (Antes de Começar) */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <span className="text-4xl mb-2">🌭🦴</span>
            <h3 className="text-lg font-black tracking-wide">Pega Petiscos do Salsicha!</h3>
            <p className="text-xs text-amber-100 mt-1 max-w-[240px]">
              Mova o Romeu para pegar ossinhos e docinhos! Desvie das meias fedidas 🧦.
            </p>
            <button
              onClick={startGame}
              className="mt-5 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Play size={16} fill="white" /> Começar Jogo
            </button>
          </div>
        )}

        {/* Tela de Fim de Jogo (Resultados) */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <Trophy size={42} className="text-amber-400 mb-2 animate-bounce" />
            <h3 className="text-xl font-black">Fim de Jogo!</h3>
            <p className="text-sm font-bold text-amber-300 mt-1">Pontuação: {score} pontos</p>
            <div className="my-3 bg-white/20 px-4 py-2 rounded-2xl border border-white/30 text-xs font-bold flex items-center gap-2">
              <span>🪙 Moedas Ganhas:</span>
              <span className="text-amber-300 text-sm font-black">+{Math.max(5, Math.floor(score / 5))}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={startGame}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <RotateCcw size={14} /> Jogar de Novo
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-white/30 hover:bg-white/40 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Sair
              </button>
            </div>
          </div>
        )}

        {/* Itens caindo do céu */}
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute text-2xl drop-shadow-sm select-none pointer-events-none transition-transform"
          >
            {item.emoji}
          </div>
        ))}

        {/* O Cachorrinho Salsicha corredor */}
        <div
          style={{
            left: `${dogPositionX}%`,
            bottom: '12px',
            transform: 'translateX(-50%)',
          }}
          className="absolute flex flex-col items-center pointer-events-none transition-all duration-75 select-none"
        >
          <div className="text-4xl drop-shadow-md">🐕</div>
        </div>

        {/* Dica de controle no celular */}
        {isPlaying && (
          <div className="absolute bottom-1 w-full text-center text-[10px] text-white/90 font-medium select-none pointer-events-none">
            Arraste o dedo para a esquerda e direita
          </div>
        )}
      </div>
    </div>
  );
};
