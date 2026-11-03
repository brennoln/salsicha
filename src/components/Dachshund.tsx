import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DachshundProps {
  isSleeping: boolean;
  actionEffect: string | null;
  happiness: number;
  isHoveredByItem?: boolean;
  onPet: () => void;
}

type IdleAction = 'idle' | 'sit' | 'sniff' | 'jump' | 'head_tilt' | 'scratch';

export const Dachshund: React.FC<DachshundProps> = ({
  isSleeping,
  actionEffect,
  happiness,
  isHoveredByItem = false,
  onPet,
}) => {
  const [currentAction, setCurrentAction] = useState<IdleAction>('idle');
  const [isBlinking, setIsBlinking] = useState(false);

  const isSuperHappy = happiness > 70;
  const isSad = happiness < 30;

  // Ciclo de ações aleatórias do cachorrinho quando não estiver dormindo
  useEffect(() => {
    if (isSleeping) {
      setCurrentAction('idle');
      return;
    }

    const actions: IdleAction[] = ['idle', 'sit', 'sniff', 'jump', 'head_tilt', 'scratch'];

    const interval = setInterval(() => {
      if (isHoveredByItem) return;

      // Escolhe uma ação aleatória diferente
      const nextAction = actions[Math.floor(Math.random() * actions.length)];
      setCurrentAction(nextAction);
    }, 4500);

    return () => clearInterval(interval);
  }, [isSleeping, isHoveredByItem]);

  // Piscar de olhos natural a cada 3.5 segundos
  useEffect(() => {
    if (isSleeping) return;

    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(blinkTimer);
  }, [isSleeping]);

  // Se estiver com item próximo, cancela qualquer ação aleatória e foca na comida/item
  const activePose = isHoveredByItem ? 'eager' : currentAction;

  return (
    <div
      id="dog-target-zone"
      onClick={onPet}
      className={`relative w-full max-w-[340px] aspect-[4/3] flex items-center justify-center cursor-pointer select-none mx-auto touch-manipulation group transition-transform ${
        isHoveredByItem ? 'scale-105' : ''
      }`}
    >
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

      {/* Sombra no chão que reage aos pulos e poses */}
      <motion.div
        className="absolute bottom-6 bg-black/20 rounded-full blur-xs transition-all duration-300"
        animate={{
          width: activePose === 'jump' ? '180px' : activePose === 'sit' ? '210px' : '250px',
          height: activePose === 'jump' ? '18px' : '26px',
          opacity: activePose === 'jump' ? 0.15 : 0.25,
        }}
      />

      {/* Desenho Completo do Cachorrinho Salsicha em SVG Animado */}
      <motion.svg
        viewBox="0 0 320 200"
        className="w-full h-full drop-shadow-lg z-10"
        animate={
          isSleeping
            ? { y: [0, 2, 0] }
            : activePose === 'jump'
            ? { y: [0, -22, 0, -14, 0] }
            : activePose === 'sit'
            ? { y: 6, rotate: -4 }
            : activePose === 'sniff'
            ? { y: 4, x: [-2, 3, -3, 2, 0] }
            : isHoveredByItem
            ? { scale: [1, 1.04, 1], y: [0, -4, 0] }
            : { y: [0, -3, 0] }
        }
        transition={{
          duration:
            activePose === 'jump'
              ? 0.7
              : activePose === 'sniff'
              ? 1.5
              : isSleeping
              ? 2.5
              : isSuperHappy
              ? 1.2
              : 2,
          repeat: activePose === 'jump' ? 2 : Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* ================= RABINHO DE SALSICHA ================= */}
        <motion.path
          d="M 55 125 Q 35 115 25 90"
          fill="none"
          stroke="#6A3414"
          strokeWidth="12"
          strokeLinecap="round"
          animate={
            isSleeping
              ? { rotate: 0 }
              : activePose === 'sit'
              ? { rotate: [-18, 22, -18] }
              : isSuperHappy || isHoveredByItem || activePose === 'jump'
              ? { rotate: [-20, 26, -20] }
              : { rotate: [-6, 8, -6] }
          }
          style={{ originX: '55px', originY: '125px' }}
          transition={{
            duration: isSuperHappy || isHoveredByItem || activePose === 'jump' ? 0.18 : 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* ================= PATINHAS TRASEIRAS ================= */}
        {/* Pata traseira esquerda */}
        <motion.rect
          x="75"
          y="140"
          width="16"
          height="30"
          rx="8"
          fill="#582a0d"
          animate={
            activePose === 'sit'
              ? { y: 6, height: 20, rotate: 25 }
              : activePose === 'scratch'
              ? { y: [-6, -18, -6], rotate: [0, 45, 0] }
              : {}
          }
          transition={{ duration: 0.25, repeat: activePose === 'scratch' ? 6 : 0 }}
        />
        {/* Pata traseira direita */}
        <motion.rect
          x="95"
          y="142"
          width="16"
          height="28"
          rx="8"
          fill="#7C3F1B"
          animate={activePose === 'sit' ? { y: 6, height: 18, rotate: 20 } : {}}
        />

        {/* ================= PATINHAS DIANTEIRAS ================= */}
        <motion.rect
          x="210"
          y="140"
          width="16"
          height="30"
          rx="8"
          fill="#582a0d"
          animate={activePose === 'sit' ? { y: 2, height: 32 } : {}}
        />
        <motion.rect
          x="230"
          y="142"
          width="16"
          height="28"
          rx="8"
          fill="#7C3F1B"
          animate={activePose === 'sit' ? { y: 2, height: 30 } : {}}
        />

        {/* ================= CORPINHO COMPRIDO ================= */}
        <motion.g
          animate={
            activePose === 'sit'
              ? { rotate: -8, y: 4 }
              : activePose === 'sniff'
              ? { rotate: 4, y: 2 }
              : {}
          }
          style={{ originX: '160px', originY: '128px' }}
        >
          <ellipse cx="160" cy="128" rx="90" ry="34" fill="#8C4920" />
          <ellipse cx="162" cy="132" rx="72" ry="24" fill="#A25727" opacity="0.4" />
        </motion.g>

        {/* ================= COLEIRA COM CORAÇÃO ================= */}
        <motion.g
          animate={
            activePose === 'sit'
              ? { y: -2, rotate: -4 }
              : activePose === 'sniff'
              ? { y: 6, rotate: 8 }
              : {}
          }
          style={{ originX: '234px', originY: '114px' }}
        >
          <rect x="228" y="96" width="12" height="36" rx="5" fill="#EF4444" transform="rotate(15 234 114)" />
          <path
            d="M 244 122 C 244 118 238 116 238 120 C 238 116 232 118 232 122 C 232 127 238 131 238 131 C 238 131 244 127 244 122 Z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="0.8"
          />
        </motion.g>

        {/* ================= CABEÇA E FOCINHO ================= */}
        <motion.g
          animate={
            activePose === 'head_tilt'
              ? { rotate: [0, 15, 15, 0] }
              : activePose === 'sniff'
              ? { y: [0, 10, 8, 11, 0], x: [0, 6, -3, 4, 0] }
              : activePose === 'sit'
              ? { y: -4, rotate: -6 }
              : activePose === 'scratch'
              ? { rotate: -10 }
              : {}
          }
          style={{ originX: '245px', originY: '85px' }}
          transition={{ duration: activePose === 'head_tilt' ? 2 : 1.4, ease: 'easeInOut' }}
        >
          {/* Cabeça */}
          <ellipse cx="245" cy="85" rx="36" ry="30" fill="#8C4920" />

          {/* Focinho Compridinho */}
          <ellipse cx="282" cy="94" rx="26" ry="17" fill="#8C4920" />
          <ellipse cx="285" cy="95" rx="20" ry="12" fill="#A25727" opacity="0.6" />

          {/* Narizinho molhado (Mexe quando fareja!) */}
          <motion.g
            animate={
              activePose === 'sniff'
                ? { scale: [1, 1.25, 0.9, 1.2, 1], x: [0, 2, -2, 1, 0] }
                : {}
            }
            transition={{ duration: 0.4, repeat: activePose === 'sniff' ? 3 : 0 }}
          >
            <ellipse cx="304" cy="93" rx="7" ry="5" fill="#1C1917" />
            <circle cx="303" cy="91" r="1.5" fill="#FFFFFF" opacity="0.8" />
          </motion.g>

          {/* Efeito visual de cheirinho quando fareja */}
          {activePose === 'sniff' && (
            <motion.text
              x="312"
              y="92"
              fontSize="12"
              opacity={0.8}
              animate={{ opacity: [0, 1, 0], x: [312, 318] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              💨
            </motion.text>
          )}

          {/* Boquinha */}
          {isSleeping ? (
            <path d="M 288 103 Q 294 105 300 102" fill="none" stroke="#3E1F0C" strokeWidth="2.5" strokeLinecap="round" />
          ) : isHoveredByItem ? (
            /* Boquinha aberta pedindo comida */
            <g>
              <ellipse cx="294" cy="106" rx="7" ry="6" fill="#450a0a" />
              <path d="M 291 108 Q 294 112 297 108" fill="#fb7185" />
            </g>
          ) : isSad ? (
            <path d="M 288 105 Q 294 102 300 105" fill="none" stroke="#3E1F0C" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <path d="M 288 102 Q 294 107 300 102" fill="none" stroke="#3E1F0C" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Linguinha aparecendo quando feliz ou pulando */}
          {!isSleeping && !isHoveredByItem && (isSuperHappy || activePose === 'jump') && (
            <motion.path
              d="M 292 105 Q 295 113 298 105 Z"
              fill="#FB7185"
              animate={{ scaleY: [1, 1.3, 1] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
          )}

          {/* Olhinhos Expressivos (Com piscadas reais!) */}
          {isSleeping || isBlinking ? (
            <path d="M 252 82 Q 257 87 262 82" fill="none" stroke="#26150B" strokeWidth="2.5" strokeLinecap="round" />
          ) : isHoveredByItem ? (
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

          {/* Orelha Comprida e Caída (Balança com pulos e coçadinhas) */}
          <motion.path
            d="M 235 68 C 220 72 210 98 215 120 C 218 132 232 135 237 122 C 242 108 245 78 235 68 Z"
            fill="#6A3414"
            stroke="#4e230b"
            strokeWidth="1.5"
            animate={
              isSleeping
                ? { rotate: 0 }
                : activePose === 'scratch'
                ? { rotate: [-10, 15, -10] }
                : activePose === 'jump'
                ? { rotate: [-18, 12, -18] }
                : activePose === 'head_tilt'
                ? { rotate: 8 }
                : isHoveredByItem
                ? { rotate: [-4, 8, -4] }
                : { rotate: [-2, 4, -2] }
            }
            style={{ originX: '235px', originY: '68px' }}
            transition={{
              duration:
                activePose === 'scratch' || activePose === 'jump'
                  ? 0.2
                  : isHoveredByItem
                  ? 0.4
                  : 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Bochecha coradinha fofa */}
          <ellipse cx="268" cy="90" rx="5" ry="3" fill="#FB7185" opacity="0.45" />
        </motion.g>
      </motion.svg>
    </div>
  );
};
