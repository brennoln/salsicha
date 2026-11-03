import React, { useState } from 'react';
import { Trophy, ArrowLeft, Heart, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoupleQuizGameProps {
  onEarnCoins: (coins: number) => void;
  onBack: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  rewardCoins: number;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    question: 'Qual é o prato/petisco que o Romeu mais ama roubar?',
    options: ['Bifinho suculento', 'Um pedaço de queijo', 'Pão quentinho', 'Uma meia perdida'],
    correctIndex: 0,
    rewardCoins: 15,
  },
  {
    question: 'Quando o salsicha está com sono, o que ele faz primeiro?',
    options: ['Dá três voltas na caminha', 'Dorme no colo', 'Fica pedindo carinho', 'Cava o cobertor'],
    correctIndex: 3,
    rewardCoins: 15,
  },
  {
    question: 'Quem dá mais petiscos escondido para o cachorrinho?',
    options: ['Brenno', 'Meu Amor', 'Ambos igualmente!', 'Nenhum dos dois'],
    correctIndex: 2,
    rewardCoins: 20,
  },
  {
    question: 'Qual é a melhor qualidade da raça salsicha?',
    options: ['Orelhinhas voadoras', 'Corpinho longo e fofo', 'Latidinho dengoso', 'Todas as anteriores!'],
    correctIndex: 3,
    rewardCoins: 25,
  },
];

export const CoupleQuizGame: React.FC<CoupleQuizGameProps> = ({ onEarnCoins, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    const isCorrect = index === currentQuestion.correctIndex;
    let earnedThisStep = isCorrect ? currentQuestion.rewardCoins : 5; // ganha 5 moedas mesmo errando pelo carinho!

    if (isCorrect) {
      confetti({ particleCount: 25, spread: 50 });
    }

    setTotalEarned((prev) => prev + earnedThisStep);
    onEarnCoins(earnedThisStep);

    setTimeout(() => {
      if (currentStep + 1 < QUIZ_QUESTIONS.length) {
        setCurrentStep((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
        confetti({ particleCount: 60, spread: 80 });
      }
    }, 1200);
  };

  const restartQuiz = () => {
    setCurrentStep(0);
    setSelectedOption(null);
    setTotalEarned(0);
    setIsFinished(false);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Topo */}
      <div className="flex items-center justify-between bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          <Heart size={13} fill="currentColor" />
          <span>Pergunta {currentStep + 1} de {QUIZ_QUESTIONS.length}</span>
        </div>
      </div>

      {/* Caixa do Quiz */}
      <div className="bg-white/95 rounded-3xl p-5 border border-amber-200 shadow-md">
        {!isFinished ? (
          <div>
            <div className="mb-4 text-center">
              <span className="text-3xl mb-1 block">🐶💬</span>
              <h3 className="font-black text-base text-slate-800 leading-snug">
                {currentQuestion.question}
              </h3>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                Vale +{currentQuestion.rewardCoins} Moedas!
              </p>
            </div>

            <div className="space-y-2.5">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let btnStyle = 'bg-amber-50/70 border-amber-200 text-slate-800 hover:bg-amber-100/70';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-sm';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between active:scale-98 ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 size={16} className="text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center text-center">
            <Trophy size={48} className="text-amber-500 mb-2 animate-bounce" />
            <h3 className="text-lg font-black text-slate-800">Parabéns ao Casal! ❤️</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              Vocês responderam tudo e ganharam muitas moedinhas para encher a despensa do Romeu!
            </p>
            <div className="my-4 bg-amber-100/80 px-5 py-2.5 rounded-2xl border border-amber-300 text-sm font-black text-amber-900 flex items-center gap-2">
              <span>🪙 Total Faturado:</span>
              <span className="text-amber-600 text-base">+{totalEarned} Moedas</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={restartQuiz}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <RotateCcw size={14} /> Jogar Novamente
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all"
              >
                Voltar à Casa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
