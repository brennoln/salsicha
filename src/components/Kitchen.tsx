import React from 'react';
import { ShoppingBag, PlusCircle, AlertCircle } from 'lucide-react';
import { FOOD_ITEMS } from '../data/items';
import { PetState } from '../types/pet';

interface KitchenProps {
  pet: PetState;
  onFeedItem: (itemId: string) => void;
  onOpenShop: () => void;
}

export const Kitchen: React.FC<KitchenProps> = ({ pet, onFeedItem, onOpenShop }) => {
  const inventoryList = FOOD_ITEMS.map((item) => ({
    ...item,
    quantity: pet.inventory[item.id] || 0,
  }));

  const hasAnyFood = inventoryList.some((item) => item.quantity > 0);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Pote de ração e ambientação da cozinha */}
      <div className="w-full bg-orange-100/70 border border-orange-200 rounded-3xl p-4 shadow-sm flex flex-col items-center">
        <div className="text-xs font-bold uppercase tracking-wider text-orange-800 mb-2 flex items-center gap-1.5">
          <span>🍳 Cozinha do {pet.name}</span>
        </div>

        {/* Tigela do Salsicha */}
        <div className="relative my-2 flex flex-col items-center">
          <div className="w-32 h-14 bg-gradient-to-b from-rose-500 to-rose-700 rounded-b-full border-4 border-rose-300 shadow-md flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1 w-24 h-4 bg-rose-900/40 rounded-full" />
            <span className="text-white font-black text-xs tracking-wider z-10 drop-shadow">
              {pet.name.toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-orange-950 mt-1.5">
            {pet.hunger >= 90
              ? '😋 O buchinho está bem cheio!'
              : '🍽️ Escolha um petisco do estoque abaixo para alimentá-lo'}
          </span>
        </div>
      </div>

      {/* Despensa / Estoque */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-amber-200 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-amber-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🥫</span>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Seu Estoque de Comida</h3>
              <p className="text-[10px] text-slate-500">Clique para dar de comer ao Romeu</p>
            </div>
          </div>
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
          >
            <ShoppingBag size={13} />
            <span>Mercadinho</span>
          </button>
        </div>

        {!hasAnyFood ? (
          <div className="py-6 flex flex-col items-center text-center px-4 bg-amber-50/60 rounded-2xl border border-dashed border-amber-300">
            <AlertCircle size={28} className="text-amber-500 mb-2" />
            <p className="font-bold text-xs text-amber-900">A despensa está vazia!</p>
            <p className="text-[11px] text-amber-700 mt-0.5 mb-3">
              Jogue minigames para ganhar moedas e compre comidinhas na lojinha.
            </p>
            <button
              onClick={onOpenShop}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 active:scale-95 transition-all"
            >
              <PlusCircle size={14} />
              <span>Comprar Comida Agora</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {inventoryList.map((item) => {
              const available = item.quantity > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => onFeedItem(item.id)}
                  disabled={!available || pet.hunger >= 100}
                  className={`flex flex-col p-2.5 rounded-2xl border text-left transition-all relative ${
                    available
                      ? 'bg-amber-50/80 border-amber-200 hover:border-amber-400 active:scale-95 shadow-xs'
                      : 'bg-slate-100/60 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl drop-shadow-xs">{item.emoji}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        available
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {item.quantity} un.
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 mt-1">{item.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                    <span className="text-emerald-600 font-bold">+{item.hungerRestore}% Fome</span>
                    <span className="text-rose-500 font-bold">+{item.happinessBonus}% ❤️</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
