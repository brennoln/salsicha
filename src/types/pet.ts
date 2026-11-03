export interface PetState {
  name: string;
  hunger: number;     // 0 a 100 (100 = satisfeito)
  happiness: number;  // 0 a 100 (100 = radiante)
  energy: number;     // 0 a 100 (100 = descansado)
  cleanliness: number;// 0 a 100 (100 = limpinho)
  isSleeping: boolean;
  lastFed: string;
  lastPlayed: string;
  lastCleaned: string;
  lastSlept: string;
  lastActionBy: string;
  lastActionText: string;
}

export type PetActionType = 'feed' | 'pet' | 'play' | 'sleep' | 'wake' | 'bath';
