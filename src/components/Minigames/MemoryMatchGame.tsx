import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoryMatchGameProps {
  onEarnCoins: (coins: number) => void;
  onBack: () => void;
}

interface Card {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_PAIRS = [
  { emoji: '🌭', name: 'Romeu' },
  { emoji: '🦴', name: 'Ossinho' },
  { emoji: '💖', name: 'Amor' },
  { emoji: '🥩', name: 'Bifinho' },
  { emoji: '🎾', name: 'Bolinha' },
  { emoji: '🛁', name: 'Banho' },
];

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onEarnCoins, onBack }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initGame = () => {
    const deck: Card[] = [];
    let id = 0;
    const duplicated = [...CARD_PAIRS, ...CARD_PAIRS];
    // Embaralhar
    duplicated.sort(() => Math.random() - 0.5);

    duplicated.forEach((item) => {
      deck.push({
        id: id++,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        // Acertou par!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === first || i === second ? { ...c, isMatched: true } : c))
          );
          setFlippedIndices([]);
        }, 500);
      } else {
        // Errou, desvira
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === first || i === second ? { ...c, isFlipped: false } : c))
          );
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // Checa vitória
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.isMatched)) {
      setIsWon(true);
      const earned = Math.max(15, 60 - moves * 2);
      onEarnCoins(earned);
      confetti({ particleCount: 50, spread: 75, origin: { y: 0.6 } });
    }
  }, [cards, moves]);

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
        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
          <span className="bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full border border-purple-300">
            🎯 Tentativas: {moves}
          </span>
        </div>
      </div>

      {/* Grid de Cartas da Memória */}
      <div className="bg-white/95 rounded-3xl p-4 border-4 border-slate-800 shadow-md">
        {!isWon ? (
          <div className="grid grid-cols-4 gap-2.5">
            {cards.map((card, index) => {
              const isVisible = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  disabled={card.isMatched || card.isFlipped}
                  className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-sm ${
                    isVisible
                      ? 'bg-amber-100 border-amber-400 rotate-0'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-slate-800 text-white'
                  }`}
                >
                  {isVisible ? card.emoji : '❓'}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center text-center">
            <Trophy size={48} className="text-yellow-400 mb-2 animate-bounce" />
            <h3 className="text-lg font-black text-slate-800">Memória de Casal Perfeita! ❤️</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              Vocês encontraram todos os pares do Romeu em {moves} jogadas!
            </p>
            <div className="my-4 bg-yellow-100 px-5 py-2.5 rounded-2xl border-2 border-amber-500 text-sm font-black text-amber-950 flex items-center gap-2">
              <span>🪙 Moedas Ganhas:</span>
              <span className="text-amber-600 text-base">+{Math.max(15, 60 - moves * 2)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={initGame}
                className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-slate-900 font-black text-xs rounded-xl border-2 border-slate-900 shadow-md flex items-center gap-1.5 transition-all"
              >
                <RotateCcw size={14} /> Jogar Novamente
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all"
              >
                Voltar aos Jogos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
