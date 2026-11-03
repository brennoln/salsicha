import React from 'react';
import { Moon, Sun, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetState } from '../types/pet';

interface BedroomProps {
  pet: PetState;
  onToggleSleep: () => void;
}

export const Bedroom: React.FC<BedroomProps> = ({ pet, onToggleSleep }) => {
  const handleToggle = () => {
    if (pet.isSleeping) {
      confetti({ particleCount: 30, spread: 60 });
    }
    onToggleSleep();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Ambiente do Quarto */}
      <div className={`w-full rounded-3xl p-5 border shadow-sm flex flex-col items-center transition-colors duration-500 ${
        pet.isSleeping
          ? 'bg-slate-900 border-indigo-950 text-indigo-200'
          : 'bg-indigo-100/70 border-indigo-200 text-indigo-950'
      }`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 opacity-80">
          <Moon size={14} /> Quarto de Dormir do {pet.name}
        </div>

        {/* Cenário da Caminha com Abajur */}
        <div className="my-4 text-center">
          <div className="text-6xl mb-2 select-none">
            {pet.isSleeping ? '🛌💤' : '🛏️🧸'}
          </div>
          <p className="text-xs font-semibold max-w-xs leading-relaxed">
            {pet.isSleeping
              ? `${pet.name} está dormindo tranquilamente e recuperando toda a energia...`
              : `${pet.name} está acordado e pronto para brincar! Toque no abajur para apagar a luz.`}
          </p>
        </div>
      </div>

      {/* Controle do Abajur */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-indigo-200 shadow-md flex justify-center">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all ${
            pet.isSleeping
              ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {pet.isSleeping ? (
            <>
              <Sun size={20} />
              <span>Acender Abajur (Acordar)</span>
            </>
          ) : (
            <>
              <Lightbulb size={20} />
              <span>Apagar Abajur (Dormir)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
