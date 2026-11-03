import React, { useState } from 'react';
import { Gamepad2, Trophy, Coins, ArrowRight, ArrowLeft } from 'lucide-react';
import { CatchTreatsGame } from './CatchTreatsGame';
import { CoupleQuizGame } from './CoupleQuizGame';

interface MinigamesHubProps {
  coins: number;
  onEarnCoins: (amount: number) => void;
  onBack: () => void;
}

export const MinigamesHub: React.FC<MinigamesHubProps> = ({ coins, onEarnCoins, onBack }) => {
  const [activeGame, setActiveGame] = useState<'catch' | 'quiz' | null>(null);

  if (activeGame === 'catch') {
    return <CatchTreatsGame onEarnCoins={onEarnCoins} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'quiz') {
    return <CoupleQuizGame onEarnCoins={onEarnCoins} onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Topo com Moedas */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between">
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
            <p className="text-[11px] text-purple-200">Joguem juntos para encher o cofrinho!</p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/30 flex items-center gap-1.5 shadow-xs">
          <Coins size={16} className="text-amber-300" />
          <span className="font-black text-sm">{coins}</span>
        </div>
      </div>

      {/* Cartões dos Minigames */}
      <div className="space-y-3">
        {/* Minigame 1: Pega Petiscos */}
        <div
          onClick={() => setActiveGame('catch')}
          className="bg-white/95 rounded-3xl p-4 border border-amber-200 shadow-sm hover:border-amber-400 active:scale-98 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl border border-amber-300 flex items-center justify-center text-3xl shadow-xs">
              🦴
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-slate-800">Pega Petiscos!</h3>
                <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  Arcade
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-[180px]">
                Pegue bifinhos e ossinhos caindo do céu em 30 segundos!
              </p>
              <span className="text-[10px] text-purple-600 font-bold mt-1 inline-flex items-center gap-1">
                <Trophy size={11} /> Até 50+ moedas por partida
              </span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Minigame 2: Quiz do Casal */}
        <div
          onClick={() => setActiveGame('quiz')}
          className="bg-white/95 rounded-3xl p-4 border border-rose-200 shadow-sm hover:border-rose-400 active:scale-98 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-rose-100 rounded-2xl border border-rose-300 flex items-center justify-center text-3xl shadow-xs">
              💖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-slate-800">Quiz do Casal & Salsicha</h3>
                <span className="text-[9px] bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                  Casal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-[180px]">
                Perguntas românticas e fofas sobre vocês e o cachorrinho.
              </p>
              <span className="text-[10px] text-rose-600 font-bold mt-1 inline-flex items-center gap-1">
                <Trophy size={11} /> Até 75 moedas
              </span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};
