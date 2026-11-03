# 🐾 Nosso Salsichinha - Joguinho de Presente para Casal

Um aplicativo web mobile (PWA) feito com muito amor para dois cuidarem juntos de um cachorrinho salsicha (Dachshund) em tempo real! 🌭❤️

Cada um joga do seu celular (Android ou iOS) e qualquer carinho, comidinha, banho ou soneca sincroniza instantaneamente na tela do outro.

---

## ✨ Funcionalidades
- **Cachorrinho Salsicha Animado**: Orelhas que balançam, rabinho animado, carinhas felizes, olhos fechados dormindo e efeitos de corações.
- **Cuidados Diários**:
  - 🍖 **Alimentar**: Satisfaz a fome e deixa o salsichinha contente.
  - 💖 **Fazer Carinho**: Toque direto no cachorrinho ou no botão para enchê-lo de amor com coraçõezinhos flutuantes!
  - 🎾 **Brincar**: Gasta energia mas aumenta muito a felicidade.
  - 🛁 **Dar Banho**: Deixa o bichinho 100% limpinho com bolhas de sabão.
  - 💤 **Dormir / Acordar**: Apaga a luz para descansar e recuperar a energia.
- **Identificação do Casal**: Alternador rápido entre quem está jogando ("Brenno" e "Meu Amor") para registrar quem fez cada ação no diário!
- **Instalável no Android (PWA)**: Pode ser adicionado à tela inicial como um app nativo em tela cheia.
- **Sincronização Online em Tempo Real**: Usando o plano gratuito do Supabase Realtime.

---

## 🚀 Como Rodar Localmente

1. Entre na pasta do projeto:
```bash
cd salsichinha-pet
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no navegador do PC ou no celular (na mesma rede Wi-Fi usando o IP local exibido no terminal).

---

## 🌐 Como Colocar Online Grátis (Vercel)

1. Suba este repositório para o seu GitHub.
2. Acesse [vercel.com](https://vercel.com) e faça login com seu GitHub.
3. Clique em **"Add New Project"** e selecione o repositório `salsichinha-pet`.
4. Clique em **"Deploy"**.
5. Pronto! Em 1 minuto vocês terão um link HTTPS (ex: `nosso-salsichinha.vercel.app`) para abrir no celular e instalar!

---

## ⚡ Conectando o Modo Multiplayer (Supabase Realtime)

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e crie um novo projeto.
2. Vá no **SQL Editor** do Supabase, cole o conteúdo do arquivo [`supabase_schema.sql`](./supabase_schema.sql) e clique em **Run**.
3. Vá em **Project Settings -> API** e copie:
   - `Project URL`
   - `anon public key`
4. No arquivo `.env` do projeto (ou nas variáveis de ambiente da Vercel), adicione:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```
Assim que configurado, o aplicativo conecta automaticamente e qualquer ação de um atualiza a tela do outro em milissegundos!
