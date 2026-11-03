import React, { useState } from 'react';
import { Gamepad2, Trophy, Coins, ArrowRight, ArrowLeft } from 'lucide-react';
import { CatchTreatsGame } from './CatchTreatsGame';
import { CoupleQuizGame } from './CoupleQuizGame';
import { SkyJumpGame } from './SkyJumpGame';
import { MemoryMatchGame } from './MemoryMatchGame';

interface MinigamesHubProps {
  coins: number;
  onEarnCoins: (amount: number) => void;
  onBack: () => void;
}

export const MinigamesHub: React.FC<MinigamesHubProps> = ({ coins, onEarnCoins, onBack }) => {
  const [activeGame, setActiveGame] = useState<'catch' | 'quiz' | 'skyjump' | 'memory' | null>(null);

  if (activeGame === 'catch') {
    return <CatchTreatsGame onEarnCoins={onEarnCoins} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'skyjump') {
    return <SkyJumpGame onEarnCoins={onEarnCoins} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'memory') {
    return <MemoryMatchGame onEarnCoins={onEarnCoins} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'quiz') {
    return <CoupleQuizGame onEarnCoins={onEarnCoins} onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Topo com Moedas */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between border-2 border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-black text-lg flex items-center gap-1.5">
              <Gamepad2 size={20} /> Parque de Jogos
            </h2>
            <p className="text-[11px] text-purple-200">Escolha um jogo para faturar moedas!</p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/30 flex items-center gap-1.5 shadow-xs">
          <Coins size={16} className="text-yellow-300" />
          <span className="font-black text-sm">{coins}</span>
        </div>
      </div>

      {/* Grade de 4 Minigames */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Minigame 1: Sky Jump (Estilo Pou) */}
        <div
          onClick={() => setActiveGame('skyjump')}
          className="bg-white rounded-2xl p-3 border-2 border-slate-800 shadow-sm hover:border-sky-500 active:scale-98 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-100 rounded-xl border-2 border-sky-400 flex items-center justify-center text-2xl shadow-xs">
              ☁️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xs text-slate-800">Sky Jump do Salsicha!</h3>
                <span className="text-[8px] bg-sky-100 text-sky-900 font-bold px-1.5 py-0.5 rounded-md">
                  Estilo Pou
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Pule de nuvem em nuvem coletando moedas douradas no céu!
              </p>
              <span className="text-[10px] text-sky-600 font-bold flex items-center gap-1 mt-0.5">
                <Trophy size={10} /> Até 60+ moedas por partida
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-sky-500 text-white shadow-xs">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Minigame 2: Jogo da Memória do Casal */}
        <div
          onClick={() => setActiveGame('memory')}
          className="bg-white rounded-2xl p-3 border-2 border-slate-800 shadow-sm hover:border-purple-500 active:scale-98 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl border-2 border-purple-400 flex items-center justify-center text-2xl shadow-xs">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xs text-slate-800">Memória do Casal & Pet</h3>
                <span className="text-[8px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.5 rounded-md">
                  Novo!
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Encontrem os pares fofos do Romeu e ganhem prêmios!
              </p>
              <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1 mt-0.5">
                <Trophy size={10} /> Até 60 moedas
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Minigame 3: Pega Petiscos */}
        <div
          onClick={() => setActiveGame('catch')}
          className="bg-white rounded-2xl p-3 border-2 border-slate-800 shadow-sm hover:border-amber-500 active:scale-98 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl border-2 border-amber-400 flex items-center justify-center text-2xl shadow-xs">
              🦴
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xs text-slate-800">Pega Petiscos!</h3>
                <span className="text-[8px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-md">
                  Arcade
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Pegue comidas caindo do céu e desvie de meias fedidas!
              </p>
              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                <Trophy size={10} /> Até 50+ moedas
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Minigame 4: Quiz do Casal */}
        <div
          onClick={() => setActiveGame('quiz')}
          className="bg-white rounded-2xl p-3 border-2 border-slate-800 shadow-sm hover:border-rose-500 active:scale-98 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-100 rounded-xl border-2 border-rose-400 flex items-center justify-center text-2xl shadow-xs">
              💖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xs text-slate-800">Quiz do Casal & Salsicha</h3>
                <span className="text-[8px] bg-rose-100 text-rose-900 font-bold px-1.5 py-0.5 rounded-md">
                  Romântico
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Respondam juntos perguntas fofas sobre a relação e o pet!
              </p>
              <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                <Trophy size={10} /> Até 75 moedas
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-rose-500 text-white shadow-xs">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
