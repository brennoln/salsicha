import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ArrowLeft, RotateCcw, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SkyJumpGameProps {
  onEarnCoins: (coins: number) => void;
  onBack: () => void;
}

interface Platform {
  id: number;
  x: number; // 5% a 75%
  y: number; // pixels do topo
  width: number;
  hasCoin?: boolean;
}

export const SkyJumpGame: React.FC<SkyJumpGameProps> = ({ onEarnCoins, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);

  const [dogX, setDogX] = useState(50); // %
  const [dogY, setDogY] = useState(250); // px
  const [dogVy, setDogVy] = useState(0);

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const startGame = () => {
    setScore(0);
    setCoinsCollected(0);
    setDogX(50);
    setDogY(240);
    setDogVy(-8.5); // pulo inicial
    setIsGameOver(false);
    setIsPlaying(true);

    // Gerar plataformas iniciais
    const initialPlats: Platform[] = [
      { id: 1, x: 40, y: 290, width: 25 },
      { id: 2, x: 20, y: 220, width: 22, hasCoin: true },
      { id: 3, x: 60, y: 150, width: 22 },
      { id: 4, x: 30, y: 80, width: 20, hasCoin: true },
      { id: 5, x: 65, y: 10, width: 20 },
    ];
    setPlatforms(initialPlats);
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const totalCoins = Math.max(5, Math.floor(score / 8) + coinsCollected * 5);
    onEarnCoins(totalCoins);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
  };

  // Loop de física do Sky Jump
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    let currentDogY = dogY;
    let currentDogVy = dogVy;
    let currentDogX = dogX;
    let currentScore = score;
    let currentCoins = coinsCollected;
    let currentPlats = [...platforms];
    let nextPlatId = 10;

    const gravity = 0.28;
    const jumpStrength = -7.8;

    const loop = () => {
      currentDogVy += gravity;
      currentDogY += currentDogVy;

      // Se o cachorrinho subir acima da metade da tela (y < 150), rolar o cenário para baixo!
      if (currentDogY < 140) {
        const diff = 140 - currentDogY;
        currentDogY = 140;
        currentScore += Math.floor(diff);

        // Descer plataformas
        currentPlats = currentPlats.map((p) => ({ ...p, y: p.y + diff }));

        // Remover plataformas que saíram por baixo e criar novas no topo
        currentPlats = currentPlats.filter((p) => p.y < 350);

        const highestY = Math.min(...currentPlats.map((p) => p.y));
        if (highestY > 60) {
          currentPlats.push({
            id: nextPlatId++,
            x: Math.floor(Math.random() * 65) + 5,
            y: highestY - (60 + Math.random() * 25),
            width: 22,
            hasCoin: Math.random() > 0.5,
          });
        }
      }

      // Colisão do pulo nas plataformas (apenas quando estiver caindo: vy > 0)
      if (currentDogVy > 0) {
        for (const plat of currentPlats) {
          // Checa se os pés do cachorro tocaram a plataforma
          if (
            currentDogY >= plat.y - 12 &&
            currentDogY <= plat.y + 6 &&
            currentDogX >= plat.x - 6 &&
            currentDogX <= plat.x + plat.width + 6
          ) {
            currentDogVy = jumpStrength; // PULA!

            // Coleta moeda se houver
            if (plat.hasCoin) {
              plat.hasCoin = false;
              currentCoins += 1;
            }
            break;
          }
        }
      }

      // Caiu da tela -> Game Over
      if (currentDogY > 340) {
        setScore(currentScore);
        setCoinsCollected(currentCoins);
        endGame();
        return;
      }

      setDogY(currentDogY);
      setDogVy(currentDogVy);
      setPlatforms(currentPlats);
      setScore(currentScore);
      setCoinsCollected(currentCoins);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isGameOver, dogX]);

  // Controles de toque/arraste para mover o salsichinha
  const handleMove = (clientX: number) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    setDogX(Math.min(90, Math.max(10, relativeX)));
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Topo */}
      <div className="flex items-center justify-between bg-white/95 p-3 rounded-2xl border-2 border-slate-800 shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-black text-slate-800 hover:text-slate-600"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-900 bg-amber-200 px-2.5 py-1 rounded-full border border-amber-400">
            🪙 {coinsCollected}
          </span>
          <span className="text-xs font-black text-sky-900 bg-sky-100 px-2.5 py-1 rounded-full border border-sky-300">
            🚀 {score}m
          </span>
        </div>
      </div>

      {/* Área do Jogo Sky Jump */}
      <div
        ref={gameAreaRef}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchStart={(e) => handleMove(e.touches[0].clientX)}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleMove(e.clientX);
        }}
        className="relative w-full h-[360px] bg-gradient-to-b from-indigo-900 via-sky-600 to-sky-300 rounded-3xl border-4 border-slate-800 shadow-inner overflow-hidden select-none touch-none"
      >
        {/* Nuvens de fundo decorativas */}
        <div className="absolute top-6 left-8 text-2xl opacity-40">☁️</div>
        <div className="absolute top-24 right-10 text-3xl opacity-30">☁️</div>

        {/* Tela Inicial */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-30">
            <span className="text-4xl mb-1">☁️🐕🚀</span>
            <h3 className="text-lg font-black tracking-wide">Sky Jump do Salsicha!</h3>
            <p className="text-xs text-sky-100 mt-1 max-w-[240px]">
              Pule de nuvem em nuvem até as estrelas! Arraste o dedo para mirar nas plataformas.
            </p>
            <button
              onClick={startGame}
              className="mt-5 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-slate-900 font-black text-sm rounded-2xl border-2 border-slate-900 shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Play size={16} fill="currentColor" /> Pular nas Nuvens!
            </button>
          </div>
        )}

        {/* Tela de Fim de Jogo */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-30">
            <Trophy size={42} className="text-yellow-400 mb-2 animate-bounce" />
            <h3 className="text-xl font-black">Que salto incrível!</h3>
            <p className="text-sm font-bold text-sky-200 mt-1">Altura: {score} metros</p>
            <div className="my-3 bg-white/20 px-4 py-2 rounded-2xl border border-white/30 text-xs font-bold flex items-center gap-2">
              <span>🪙 Moedas Ganhas:</span>
              <span className="text-yellow-300 text-sm font-black">
                +{Math.max(5, Math.floor(score / 8) + coinsCollected * 5)}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={startGame}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-slate-900 font-black text-xs rounded-xl border-2 border-slate-900 shadow-md flex items-center gap-1.5 transition-all"
              >
                <RotateCcw size={14} /> Pular de Novo
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-white/30 hover:bg-white/40 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/40 shadow-md transition-all"
              >
                Sair
              </button>
            </div>
          </div>
        )}

        {/* Plataformas de Nuvens */}
        {platforms.map((plat) => (
          <div
            key={plat.id}
            style={{
              left: `${plat.x}%`,
              top: `${plat.y}px`,
              width: `${plat.width}%`,
            }}
            className="absolute h-5 bg-white/95 rounded-full border-2 border-sky-300 shadow-md flex items-center justify-center pointer-events-none"
          >
            {plat.hasCoin && (
              <span className="absolute -top-4 text-xs animate-bounce select-none">
                🪙
              </span>
            )}
          </div>
        ))}

        {/* O Cachorrinho Salsicha Voador */}
        <div
          style={{
            left: `${dogX}%`,
            top: `${dogY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute text-3xl pointer-events-none drop-shadow-md select-none transition-transform"
        >
          {dogVy < 0 ? '🐕💨' : '🐕'}
        </div>

        {isPlaying && (
          <div className="absolute bottom-2 w-full text-center text-[10px] text-white/90 font-bold select-none pointer-events-none">
            Arraste para guiar o salsicha
          </div>
        )}
      </div>
    </div>
  );
};
