export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  count: number;
  hungerRestore: number;
  happinessBonus: number;
  price: number;
  description: string;
}

export interface PetState {
  name: string;
  hunger: number;     // 0 a 100
  happiness: number;  // 0 a 100
  energy: number;     // 0 a 100
  cleanliness: number;// 0 a 100
  isSleeping: boolean;
  coins: number;      // Moeda do jogo (Patas / PetCoins)
  inventory: Record<string, number>; // id do item -> quantidade
  lastFed: string;
  lastPlayed: string;
  lastCleaned: string;
  lastSlept: string;
  lastActionBy: string;
  lastActionText: string;
}

export type RoomType = 'living' | 'kitchen' | 'bathroom' | 'bedroom' | 'minigames' | 'shop';

export type PetActionType = 'feed' | 'pet' | 'play' | 'sleep' | 'wake' | 'bath';
