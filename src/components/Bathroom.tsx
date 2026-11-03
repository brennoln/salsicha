import React, { useState } from 'react';
import { Bath } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetState } from '../types/pet';

interface BathroomProps {
  pet: PetState;
  onFinishBath: () => void;
}

export const Bathroom: React.FC<BathroomProps> = ({ pet, onFinishBath }) => {
  const [bubblesCount, setBubblesCount] = useState(0);

  const handleSoap = () => {
    setBubblesCount((prev) => Math.min(10, prev + 2));
  };

  const handleShower = () => {
    if (bubblesCount < 4) {
      alert('Ensaboe o cachorrinho com a esponja primeiro! 🧼');
      return;
    }
    setBubblesCount(0);
    confetti({ particleCount: 35, spread: 60 });
    onFinishBath();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Ambiente do Banheiro */}
      <div className="w-full bg-cyan-100/70 border border-cyan-200 rounded-3xl p-4 shadow-sm flex flex-col items-center relative overflow-hidden">
        <div className="text-xs font-bold uppercase tracking-wider text-cyan-800 mb-2 flex items-center gap-1.5">
          <Bath size={14} /> Banheiro do {pet.name}
        </div>

        {/* Bolhinhas flutuantes interativas */}
        {bubblesCount > 0 && (
          <div className="absolute inset-0 pointer-events-none flex justify-around items-center opacity-80">
            {Array.from({ length: bubblesCount }).map((_, i) => (
              <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 120}ms` }}>
                🫧
              </span>
            ))}
          </div>
        )}

        <div className="text-center my-3">
          <div className="text-5xl mb-2">🛁🦆</div>
          <p className="text-xs font-semibold text-cyan-950">
            {pet.cleanliness === 100
              ? '✨ O salsichinha já está cheiroso e brilhando!'
              : bubblesCount >= 4
              ? '🚿 Agora use o chuveirinho para enxaguar!'
              : '🧼 Passe a esponja de sabão para ensaboar!'}
          </p>
        </div>
      </div>

      {/* Controles de Banho */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-cyan-200 shadow-md flex justify-around">
        <button
          onClick={handleSoap}
          className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-cyan-50 hover:bg-cyan-100 active:scale-95 border border-cyan-200 shadow-xs transition-all"
        >
          <span className="text-3xl">🧼</span>
          <span className="text-xs font-bold text-cyan-900">Passar Esponja</span>
          <span className="text-[10px] text-cyan-600 font-semibold">{bubblesCount}/4 Espuma</span>
        </button>

        <button
          onClick={handleShower}
          disabled={bubblesCount < 4}
          className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 active:scale-95 disabled:opacity-40 border border-sky-200 shadow-xs transition-all"
        >
          <span className="text-3xl">🚿</span>
          <span className="text-xs font-bold text-sky-900">Enxaguar</span>
          <span className="text-[10px] text-sky-600 font-semibold">Tirar espuma</span>
        </button>
      </div>
    </div>
  );
};
