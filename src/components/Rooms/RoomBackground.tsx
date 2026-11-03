import React from 'react';
import { RoomType } from '../../types/pet';

interface RoomBackgroundProps {
  room: RoomType;
  isSleeping?: boolean;
}

export const RoomBackground: React.FC<RoomBackgroundProps> = ({ room, isSleeping }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* ================= COZINHA ================= */}
      {room === 'kitchen' && (
        <div className="w-full h-full relative bg-amber-100 flex flex-col justify-between">
          {/* Parede com Azulejos Retrô de Cozinha */}
          <div
            className="w-full h-[68%] relative"
            style={{
              backgroundImage: `
                radial-gradient(circle, #fde047 10%, transparent 11%),
                radial-gradient(circle, #fb923c 10%, transparent 11%)
              `,
              backgroundColor: '#fef08a',
              backgroundSize: '36px 36px',
              backgroundPosition: '0 0, 18px 18px',
            }}
          >
            {/* Prateleira suspensa de madeira com potes */}
            <div className="absolute top-6 left-6 right-6 h-3 bg-amber-800 rounded-sm shadow-md border-b-2 border-amber-950 flex items-end justify-around px-4">
              <span className="text-xl -translate-y-2 drop-shadow-xs">🫙</span>
              <span className="text-xl -translate-y-2 drop-shadow-xs">🧂</span>
              <span className="text-xl -translate-y-2 drop-shadow-xs">🍯</span>
              <span className="text-xl -translate-y-2 drop-shadow-xs">☕</span>
            </div>

            {/* Quadro de recado na parede da cozinha */}
            <div className="absolute top-24 left-6 bg-white/90 p-2 rounded-xl shadow-md border border-amber-300 transform -rotate-3 text-center">
              <span className="text-[10px] font-black text-amber-900 block leading-tight">
                CARDÁPIO DO DIA
              </span>
              <span className="text-xs">🦴 🥩 🥣</span>
            </div>

            {/* Relógio de parede fofo */}
            <div className="absolute top-20 right-8 w-11 h-11 bg-white rounded-full border-4 border-amber-600 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full relative">
                <div className="absolute w-2.5 h-0.5 bg-slate-800 -top-0.5 left-0 origin-left -rotate-45" />
                <div className="absolute w-3.5 h-0.5 bg-red-500 -top-0.5 left-0 origin-left rotate-45" />
              </div>
            </div>
          </div>

          {/* Faixa divisória / Rodapé da bancada */}
          <div className="w-full h-4 bg-amber-900 shadow-sm border-t border-amber-950" />

          {/* Piso de Cozinha Xadrez Estilo Vintage */}
          <div
            className="w-full h-[32%] relative"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #fcd34d 25%, transparent 25%),
                linear-gradient(-45deg, #fcd34d 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #fcd34d 75%),
                linear-gradient(-45deg, transparent 75%, #fcd34d 75%)
              `,
              backgroundColor: '#f59e0b',
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
            }}
          >
            {/* Sombra de perspectiva do chão */}
            <div className="w-full h-8 bg-gradient-to-b from-black/20 to-transparent" />
          </div>
        </div>
      )}

      {/* ================= BANHEIRO (Inspirado no print do Pou!) ================= */}
      {room === 'bathroom' && (
        <div className="w-full h-full relative bg-cyan-200 flex flex-col justify-between">
          {/* Parede com Padrão Geométrico do Pou */}
          <div
            className="w-full h-[70%] relative overflow-hidden"
            style={{
              backgroundColor: '#38bdf8',
              backgroundImage: `
                radial-gradient(circle at 50% 50%, #7dd3fc 18%, transparent 19%),
                radial-gradient(circle at 0% 0%, #0284c7 24%, transparent 25%),
                radial-gradient(circle at 100% 100%, #0284c7 24%, transparent 25%)
              `,
              backgroundSize: '44px 44px',
            }}
          >
            {/* Espelho / Armário do Banheiro na parede */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-20 bg-sky-100/90 rounded-2xl border-4 border-white shadow-lg backdrop-blur-xs flex items-center justify-center overflow-hidden">
              {/* Brilho diagonal do vidro */}
              <div className="absolute w-44 h-6 bg-white/40 rotate-45 transform translate-y-2" />
              <span className="text-2xl drop-shadow-xs">🫧</span>
            </div>

            {/* Toalha pendurada */}
            <div className="absolute top-16 right-6 flex flex-col items-center">
              <div className="w-8 h-2 bg-slate-300 rounded-full shadow-xs" />
              <div className="w-6 h-14 bg-rose-400 rounded-b-md shadow-md border-t-2 border-rose-500" />
            </div>

            {/* Patinho de borracha flutuando de enfeite */}
            <div className="absolute top-16 left-6 text-2xl drop-shadow-md">
              🐥
            </div>
          </div>

          {/* Rodapé de azulejo branco */}
          <div className="w-full h-4 bg-sky-800 shadow-sm border-t border-sky-950" />

          {/* Piso de Banheiro Lavável */}
          <div
            className="w-full h-[30%] relative"
            style={{
              backgroundColor: '#e0f2fe',
              backgroundImage: `
                linear-gradient(to right, #bae6fd 2px, transparent 2px),
                linear-gradient(to bottom, #bae6fd 2px, transparent 2px)
              `,
              backgroundSize: '36px 36px',
            }}
          >
            <div className="w-full h-6 bg-gradient-to-b from-black/15 to-transparent" />
          </div>
        </div>
      )}

      {/* ================= QUARTO ================= */}
      {room === 'bedroom' && (
        <div
          className={`w-full h-full relative flex flex-col justify-between transition-colors duration-700 ${
            isSleeping ? 'bg-indigo-950' : 'bg-indigo-900'
          }`}
        >
          {/* Parede com estrelinhas e lua */}
          <div
            className="w-full h-[70%] relative"
            style={{
              backgroundColor: isSleeping ? '#0f172a' : '#312e81',
              backgroundImage: isSleeping
                ? `radial-gradient(white 1px, transparent 1px)`
                : `radial-gradient(#c7d2fe 1.5px, transparent 1.5px)`,
              backgroundSize: '32px 32px',
            }}
          >
            {/* Janela noturna com lua */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-28 h-28 bg-indigo-950/80 rounded-full border-4 border-indigo-300 shadow-inner flex items-center justify-center overflow-hidden">
              <span className="text-3xl drop-shadow">🌙</span>
              <span className="text-xs text-indigo-200 absolute bottom-3">✨</span>
            </div>

            {/* Cordão de luzinhas fofas penduradas */}
            <div className="absolute top-2 left-0 right-0 flex justify-around text-sm select-none">
              <span>⭐</span>
              <span>💛</span>
              <span>⭐</span>
              <span>💜</span>
              <span>⭐</span>
              <span>💛</span>
              <span>⭐</span>
            </div>
          </div>

          <div className="w-full h-4 bg-indigo-950 shadow-sm border-t border-indigo-900" />

          {/* Piso de Quarto com Assoalho de Madeira Aconchegante */}
          <div
            className="w-full h-[30%] relative"
            style={{
              backgroundColor: isSleeping ? '#3b2014' : '#6b3618',
              backgroundImage: `linear-gradient(to right, ${
                isSleeping ? '#29140a' : '#52250d'
              } 2px, transparent 2px)`,
              backgroundSize: '48px 100%',
            }}
          >
            {/* Tapete redondo no quarto */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-16 bg-purple-400/40 rounded-full border-2 border-dashed border-purple-300/60" />
            <div className="w-full h-6 bg-gradient-to-b from-black/25 to-transparent" />
          </div>
        </div>
      )}

      {/* ================= JARDIM / QUINTAL (Inspirado no print do Pou!) ================= */}
      {room === 'garden' && (
        <div className="w-full h-full relative bg-sky-300 flex flex-col justify-between">
          {/* Céu azul vibrante com nuvens */}
          <div className="w-full h-[65%] relative bg-gradient-to-b from-sky-400 to-sky-200">
            {/* Sol brilhante */}
            <div className="absolute top-4 right-6 w-14 h-14 bg-amber-300 rounded-full shadow-lg border-2 border-amber-200 animate-pulse flex items-center justify-center text-xl">
              ☀️
            </div>

            {/* Nuvens fofas do Pou */}
            <div className="absolute top-8 left-6 text-3xl opacity-90">☁️</div>
            <div className="absolute top-16 right-20 text-2xl opacity-80">☁️</div>

            {/* Fileira de pinheiros/árvores no horizonte (como no Pou!) */}
            <div className="absolute bottom-0 w-full flex justify-between items-end px-2 select-none overflow-hidden">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="text-3xl transform translate-y-1">
                  🌲
                </div>
              ))}
            </div>
          </div>

          {/* Cerquinha de Madeira */}
          <div className="w-full h-3 bg-amber-800/80 border-t border-amber-900" />

          {/* Gramado Verde com Florzinhas */}
          <div className="w-full h-[35%] bg-emerald-500 relative overflow-hidden">
            {/* Florzinhas brotando na grama */}
            <div className="absolute inset-0 flex justify-around items-center px-4">
              <span className="text-xl">🌸</span>
              <span className="text-xl translate-y-2">🌼</span>
              <span className="text-xl -translate-y-1">🌷</span>
              <span className="text-xl translate-y-3">🌸</span>
              <span className="text-xl">🌼</span>
            </div>
            <div className="w-full h-4 bg-black/10" />
          </div>
        </div>
      )}

      {/* ================= SALA DE ESTAR (Estilo Laboratório Retrô do Pou) ================= */}
      {room === 'living' && (
        <div className="w-full h-full relative bg-teal-100 flex flex-col justify-between">
          {/* Papel de Parede Retrô com Círculos Concêntricos (Pou style) */}
          <div
            className="w-full h-[68%] relative"
            style={{
              backgroundColor: '#0d9488',
              backgroundImage: `
                radial-gradient(circle, transparent 20%, #0f766e 20%, #0f766e 30%, transparent 30%, transparent 40%, #115e59 40%, #115e59 55%, transparent 55%),
                radial-gradient(circle, transparent 20%, #0f766e 20%, #0f766e 30%, transparent 30%, transparent 40%, #115e59 40%, #115e59 55%, transparent 55%)
              `,
              backgroundSize: '54px 54px',
              backgroundPosition: '0 0, 27px 27px',
            }}
          >
            {/* Porta-retrato romântico do casal na parede */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-amber-100 p-2.5 rounded-2xl shadow-xl border-4 border-amber-400 flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-base">
                <span>👨‍💻</span>
                <span className="text-rose-500 text-xs animate-pulse">❤️</span>
                <span>👩‍🦰</span>
              </div>
              <span className="text-[9px] font-black text-amber-900 mt-0.5 tracking-wider">
                BRENNO & AMOR
              </span>
            </div>

            {/* Planta samambaia na sala */}
            <div className="absolute bottom-2 left-6 text-3xl drop-shadow-md">
              🪴
            </div>

            {/* Luminária retrô */}
            <div className="absolute top-6 right-6 text-2xl drop-shadow-md">
              🏮
            </div>
          </div>

          {/* Rodapé de madeira nobre */}
          <div className="w-full h-4 bg-amber-950 shadow-sm border-t border-amber-900" />

          {/* Piso de Madeira com Tapete Oval Aconchegante */}
          <div
            className="w-full h-[32%] relative"
            style={{
              backgroundColor: '#78350f',
              backgroundImage: `linear-gradient(to right, #451a03 2px, transparent 2px)`,
              backgroundSize: '40px 100%',
            }}
          >
            {/* Tapete felpudo onde o salsichinha fica */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-16 bg-rose-200/90 rounded-full border-4 border-rose-300 shadow-md flex items-center justify-center">
              <span className="text-xs font-black text-rose-400 opacity-60 tracking-widest">
                🐾 NOSSO CANTINHO 🐾
              </span>
            </div>
            <div className="w-full h-6 bg-gradient-to-b from-black/25 to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
};
