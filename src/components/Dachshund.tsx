import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DachshundProps {
  isSleeping: boolean;
  actionEffect: string | null;
  happiness: number;
  isHoveredByItem?: boolean;
  onPet: () => void;
}

export const Dachshund: React.FC<DachshundProps> = ({
  isSleeping,
  actionEffect,
  happiness,
  isHoveredByItem = false,
  onPet,
}) => {
  const isSuperHappy = happiness > 70;
  const isSad = happiness < 30;

  return (
    <div
      id="dog-target-zone"
      onClick={onPet}
      className={`relative w-full max-w-[340px] aspect-[4/3] flex items-center justify-center cursor-pointer select-none mx-auto touch-manipulation group transition-transform ${
        isHoveredByItem ? 'scale-105' : ''
      }`}
    >
      {/* Indicador de interação */}
      <div className="absolute -top-4 text-xs font-semibold px-3 py-1 rounded-full bg-white/90 text-slate-800 border-2 border-slate-800 shadow-md backdrop-blur-xs flex items-center gap-1 group-active:scale-95 transition-transform pointer-events-none">
        <span>
          {isHoveredByItem
            ? '😋 Solte aqui para ele usar!'
            : '🐾 Arraste itens até ele ou toque para carinho!'}
        </span>
      </div>

      {/* Efeitos flutuantes com Framer Motion */}
      <AnimatePresence>
        {actionEffect === 'heart' && (
          <motion.div
            key="heart"
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -45, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 text-3xl pointer-events-none z-30"
          >
            💖
          </motion.div>
        )}
        {actionEffect === 'food' && (
          <motion.div
            key="food"
            initial={{ opacity: 0, y: 5, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 text-3xl font-black text-amber-900 pointer-events-none z-30 drop-shadow"
          >
            🍖 *NHAC NHAC!*
          </motion.div>
        )}
        {actionEffect === 'bath' && (
          <motion.div
            key="bath"
            initial={{ opacity: 0, y: 10, scale: 0.6 }}
            animate={{ opacity: 1, y: -45, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 text-3xl pointer-events-none z-30"
          >
            ✨🫧 Cheiroso!
          </motion.div>
        )}
        {isSleeping && (
          <motion.div
            key="sleep"
            animate={{ y: [-5, -25], opacity: [0.3, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 right-12 text-2xl font-black text-indigo-300 select-none pointer-events-none z-30"
          >
            Zzz...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sombra suave no chão do cômodo */}
      <div className="absolute bottom-6 w-64 h-7 bg-black/20 rounded-full blur-xs transition-all duration-300" />

      {/* Desenho do Cachorrinho Salsicha SVG */}
      <motion.svg
        viewBox="0 0 320 200"
        className="w-full h-full drop-shadow-lg z-10"
        animate={
          isSleeping
            ? { y: [0, 2, 0] }
            : actionEffect === 'heart' || actionEffect === 'food'
            ? { scale: [1, 1.04, 1], y: [0, -5, 0] }
            : { y: [0, -3, 0] }
        }
        transition={{
          duration: isSleeping ? 2.5 : isSuperHappy ? 1.2 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Rabinho de Salsicha animado */}
        <motion.path
          d="M 55 125 Q 35 115 25 90"
          fill="none"
          stroke="#6A3414"
          strokeWidth="12"
          strokeLinecap="round"
          animate={
            isSleeping
              ? { rotate: [0, 0] }
              : isSuperHappy || actionEffect === 'heart' || isHoveredByItem
              ? { rotate: [-15, 20, -15] }
              : { rotate: [-4, 6, -4] }
          }
          style={{ originX: '55px', originY: '125px' }}
          transition={{ duration: isSuperHappy || isHoveredByItem ? 0.2 : 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Patinhas Traseiras */}
        <rect x="75" y="140" width="16" height="30" rx="8" fill="#582a0d" />
        <rect x="95" y="142" width="16" height="28" rx="8" fill="#7C3F1B" />

        {/* Patinhas Dianteiras */}
        <rect x="210" y="140" width="16" height="30" rx="8" fill="#582a0d" />
        <rect x="230" y="142" width="16" height="28" rx="8" fill="#7C3F1B" />

        {/* Corpinho Comprido Clássico do Salsicha */}
        <ellipse cx="160" cy="128" rx="90" ry="34" fill="#8C4920" />
        <ellipse cx="162" cy="132" rx="72" ry="24" fill="#A25727" opacity="0.4" />

        {/* Coleira com Pingente de Coração */}
        <rect x="228" y="96" width="12" height="36" rx="5" fill="#EF4444" transform="rotate(15 234 114)" />
        <path
          d="M 244 122 C 244 118 238 116 238 120 C 238 116 232 118 232 122 C 232 127 238 131 238 131 C 238 131 244 127 244 122 Z"
          fill="#FBBF24"
          stroke="#D97706"
          strokeWidth="0.8"
        />

        {/* Cabeça do Salsicha */}
        <ellipse cx="245" cy="85" rx="36" ry="30" fill="#8C4920" />

        {/* Focinho Compridinho */}
        <ellipse cx="282" cy="94" rx="26" ry="17" fill="#8C4920" />
        <ellipse cx="285" cy="95" rx="20" ry="12" fill="#A25727" opacity="0.6" />

        {/* Narizinho preto molhado e brilhante */}
        <ellipse cx="304" cy="93" rx="7" ry="5" fill="#1C1917" />
        <circle cx="303" cy="91" r="1.5" fill="#FFFFFF" opacity="0.8" />

        {/* Boquinha (Abre quando a comida se aproxima!) */}
        {isSleeping ? (
          <path d="M 288 103 Q 294 105 300 102" fill="none" stroke="#3E1F0C" strokeWidth="2.5" strokeLinecap="round" />
        ) : isHoveredByItem ? (
          /* Boca aberta esperando a comida */
          <g>
            <ellipse cx="294" cy="106" rx="7" ry="6" fill="#450a0a" />
            <path d="M 291 108 Q 294 112 297 108" fill="#fb7185" />
          </g>
        ) : isSad ? (
          <path d="M 288 105 Q 294 102 300 105" fill="none" stroke="#3E1F0C" strokeWidth="2.5" strokeLinecap="round" />
        ) : (
          <path d="M 288 102 Q 294 107 300 102" fill="none" stroke="#3E1F0C" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Linguinha aparecendo quando super feliz */}
        {!isSleeping && !isHoveredByItem && isSuperHappy && (
          <motion.path
            d="M 292 105 Q 295 113 298 105 Z"
            fill="#FB7185"
            animate={{ scaleY: [1, 1.25, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}

        {/* Olhinhos Expressivos */}
        {isSleeping ? (
          <path d="M 252 82 Q 257 87 262 82" fill="none" stroke="#26150B" strokeWidth="2.5" strokeLinecap="round" />
        ) : isHoveredByItem ? (
          /* Olhos arregalados e brilhantes de vontade de comer */
          <g>
            <ellipse cx="258" cy="78" rx="7.5" ry="8.5" fill="#26150B" />
            <circle cx="256" cy="76" r="3" fill="#FFFFFF" />
            <circle cx="261" cy="81" r="1.5" fill="#FFFFFF" />
          </g>
        ) : isSad ? (
          <g>
            <ellipse cx="258" cy="80" rx="6" ry="7" fill="#26150B" />
            <circle cx="256" cy="78" r="2.2" fill="#FFFFFF" />
            <path d="M 252 73 Q 258 76 264 72" fill="none" stroke="#4A2610" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <ellipse cx="258" cy="79" rx="6.5" ry="7.5" fill="#26150B" />
            <circle cx="256" cy="77" r="2.5" fill="#FFFFFF" />
            <circle cx="260" cy="82" r="1.2" fill="#FFFFFF" />
          </g>
        )}

        {/* Orelha Comprida e Caída */}
        <motion.path
          d="M 235 68 C 220 72 210 98 215 120 C 218 132 232 135 237 122 C 242 108 245 78 235 68 Z"
          fill="#6A3414"
          stroke="#4e230b"
          strokeWidth="1.5"
          animate={
            isSleeping
              ? { rotate: 0 }
              : isHoveredByItem
              ? { rotate: [-4, 8, -4] }
              : { rotate: [-2, 4, -2] }
          }
          style={{ originX: '235px', originY: '68px' }}
          transition={{ duration: isHoveredByItem ? 0.4 : 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Bochecha corada */}
        <ellipse cx="268" cy="90" rx="5" ry="3" fill="#FB7185" opacity="0.45" />
      </motion.svg>
    </div>
  );
};
