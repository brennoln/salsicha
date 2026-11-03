-- ===================================================
-- Schema para o Joguinho do Salsichinha (Multiplayer Casal)
-- Cole este script no SQL Editor do seu projeto Supabase
-- ===================================================

-- 1. Criação da tabela de pets
CREATE TABLE IF NOT EXISTS public.pets (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitação de RLS (Row Level Security) permissivo para o casal
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública" ON public.pets
  FOR SELECT USING (true);

CREATE POLICY "Permitir atualização pública" ON public.pets
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Habilitar Realtime para a tabela pets
ALTER PUBLICATION supabase_realtime ADD TABLE public.pets;

-- 4. Inserir estado inicial do Romeu (com moedas e inventário)
INSERT INTO public.pets (id, state)
VALUES (
  'primary_pet',
  '{
    "name": "Romeu",
    "hunger": 70,
    "happiness": 85,
    "energy": 80,
    "cleanliness": 80,
    "isSleeping": false,
    "coins": 50,
    "inventory": {
      "kibble": 4,
      "meat_treat": 2,
      "carrot": 2
    },
    "lastFed": "2026-11-03T12:00:00.000Z",
    "lastPlayed": "2026-11-03T12:00:00.000Z",
    "lastCleaned": "2026-11-03T12:00:00.000Z",
    "lastSlept": "2026-11-03T12:00:00.000Z",
    "lastActionBy": "Sistema",
    "lastActionText": "Romeu acabou de chegar para ser amado por vocês!"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET state = EXCLUDED.state;
