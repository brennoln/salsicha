import React from 'react';
import { ShoppingBag, Coins, Gamepad2, ArrowLeft } from 'lucide-react';
import { FOOD_ITEMS } from '../data/items';
import { PetState } from '../types/pet';

interface ShopProps {
  pet: PetState;
  onBuyItem: (itemId: string, price: number) => void;
  onGoToMinigames: () => void;
  onBack: () => void;
}

export const Shop: React.FC<ShopProps> = ({
  pet,
  onBuyItem,
  onGoToMinigames,
  onBack,
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Topo da Loja */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-black text-lg flex items-center gap-1.5">
              <ShoppingBag size={20} /> Mercadinho Pet
            </h2>
            <p className="text-[11px] text-amber-100">Compre petiscos para repor o estoque!</p>
          </div>
        </div>

        {/* Saldo de Moedas */}
        <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/30 flex items-center gap-1.5 shadow-xs">
          <Coins size={16} className="text-amber-200" />
          <span className="font-black text-sm tracking-wide">{pet.coins}</span>
        </div>
      </div>

      {/* Banner de Ganhar Moedas */}
      <div className="bg-purple-100/90 border border-purple-200 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <div>
            <p className="text-xs font-bold text-purple-950">Precisa de mais moedas?</p>
            <p className="text-[10px] text-purple-700">Jogue minigames em casal para faturar!</p>
          </div>
        </div>
        <button
          onClick={onGoToMinigames}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Gamepad2 size={13} />
          <span>Jogar</span>
        </button>
      </div>

      {/* Lista de Itens do Mercadinho */}
      <div className="space-y-2.5">
        {FOOD_ITEMS.map((item) => {
          const canAfford = pet.coins >= item.price;
          const currentStock = pet.inventory[item.id] || 0;

          return (
            <div
              key={item.id}
              className="bg-white/95 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-2xl shadow-xs">
                  {item.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-800">{item.name}</h4>
                    {currentStock > 0 && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                        no estoque: {currentStock}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className="text-emerald-600 font-bold">+{item.hungerRestore}% Fome</span>
                    <span className="text-rose-500 font-bold">+{item.happinessBonus}% Amor</span>
                  </div>
                </div>
              </div>

              {/* Botão de Comprar */}
              <button
                onClick={() => onBuyItem(item.id, item.price)}
                disabled={!canAfford}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Coins size={13} className={canAfford ? 'text-amber-200' : 'text-slate-400'} />
                <span>{item.price}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
