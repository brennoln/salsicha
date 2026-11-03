export interface FoodItemDefinition {
  id: string;
  name: string;
  emoji: string;
  hungerRestore: number;
  happinessBonus: number;
  price: number;
  description: string;
}

export const FOOD_ITEMS: FoodItemDefinition[] = [
  {
    id: 'kibble',
    name: 'Ração Crocante',
    emoji: '🥣',
    hungerRestore: 20,
    happinessBonus: 5,
    price: 10,
    description: 'A raçãozinha diária nutritiva e balanceada.',
  },
  {
    id: 'meat_treat',
    name: 'Bifinho Macio',
    emoji: '🥩',
    hungerRestore: 35,
    happinessBonus: 15,
    price: 25,
    description: 'O petisco preferido de todo salsicha!',
  },
  {
    id: 'big_bone',
    name: 'Ossinho Recheado',
    emoji: '🦴',
    hungerRestore: 45,
    happinessBonus: 25,
    price: 40,
    description: 'Dura bastante tempo e diverte enquanto mastiga.',
  },
  {
    id: 'carrot',
    name: 'Cenourinha Gelada',
    emoji: '🥕',
    hungerRestore: 15,
    happinessBonus: 10,
    price: 8,
    description: 'Crocante, saudável e limpa os dentinhos.',
  },
  {
    id: 'pet_cake',
    name: 'Bolo de Festa Pet',
    emoji: '🧁',
    hungerRestore: 60,
    happinessBonus: 50,
    price: 80,
    description: 'Uma sobremesa especial de comemoração do casal!',
  },
];
