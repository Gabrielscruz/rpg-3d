# RPG AÇÃO 3D  - Roadmap & Arquitetura

Bem-vindo ao repositório do RPG Action 3D, um VTT (Virtual Tabletop) 3D colaborativo com sistema de papéis e controle de permissões (RBAC). A meta é construir uma plataforma semelhante ao Let's Role, com importação nativa de assets `glTF/.glb` e planos 2D interativos, além de ser facilmente escalável para regras específicas ou inventários robustos.

Abaixo está o nosso roadmap oficial com a divisão de tarefas, banco de dados recomendado e passos para o **MVP (Mínimo Produto Viável)** até as expansões avançadas da **Fase 2**.

---

## 📌 Fase 1: MVP (O Piloto da Plataforma)
O grande objetivo da Fase 1 é garantir o fluxo vital: Logar -> Entrar na Mesa (RBAC) -> Mover Tokens no grid 3D -> Rolar Dados no Chat sincronizadamente.
Nesta fase, simplificaremos as regras do personagem para abraçar qualquer sistema de RPG antes de engessar numa regra do zero.

### 🗄️ Backend Crítico & Banco de Dados (ex: PostgreSQL/Supabase)
- [ ] **Acesso Global (RBAC)**
  - Tabela `users`: Dados básicos e de controle de e-mail.
  - Tabela `roles` e `user_roles`: Permissões essenciais do sistema (admin, creator, user comum).
- [ ] **Mesas & Controle Local (RBAC in-game)**
  - Tabela `mesas`: (id, titulo_da_sessao, descricao, json_configs).
  - Tabela `mesa_participantes`: Fundamental. Associa `user` <-> `mesa` como Mestre, Jogador ou Espectador.
- [ ] **O Core 3D (Cenas & Tabuleiro)**
  - Tabela `cenas`: Gerencia qual ambiente a mesa está observando em tempo real.
  - Tabela `scene_objects`: Unifica os Tokens de Players, Montros, Objetos de Cenário e Mapas achatados. Guarda (X, Y, Z, Rotação e Escala), assim como a `URL` do modelo/imagem em nuvem. Permite movimentação multi-usuário.
- [ ] **Fichas e Personagens Ágeis**
  - Tabela `personagens`: Uma tabela rápida contendo Nome, HP Máximo e Atual. O detalhamento do resto das habilidades vai dentro de uma coluna única `sheet_data` (JSONB), que permite testar D&D ou Call of Cthulhu de imediato.
- [ ] **Chat Baseado em Socket/Realtime**
  - Tabela `chat_mensagens`: Funde os textos de interpretação com logs limpos de resultados dos rolamentos de dados e cálculos.
- [ ] **Biblioteca Primitiva 3D**
  - Tabela `assets`: Guarda modelos `.glb` e texturas enviadas, linkados ao jogador.

### 💻 Frontend (Nossos Componentes Atuais em React/R3F)
- [x] Construção do Tabuleiro Base (Board / Grid 40x40)
- [x] Importação nativa e parsing de `.glb` (Meshy) e `.png`
- [x] `TransformPanel` de UI para alterar Posições, Tamanho e Rotações 3D
- [x] Lógica de foco de Câmera na edição do objeto
- [ ] **A Fazer:** Transformar os estados locais (`gameStore` Zustand) num client-sync multi-player conectado a um serviço como Pusher, Supabase Realtime ou NodeJS puro.

---

## 🚀 Fase 2: O Ecossistema (Let's Role Completo)
Com o sistema síncrono rodando perfeitamente e os jogadores se movimentando sem lag na engine, desmembramos e fortificamos a arquitetura.

- [ ] **Sistemas e Regras Estritas**
  - Quebrar o JSONB dos personagens em tabelas nativas de relacionamento: `itens`, `magias`, `condicoes`.
  - Implementar inventários, cálculo automático de dano vs defesa por ataque, perícias avançadas e rolamentos integrados diretos.
- [ ] **Fog of War Dinâmico & Line of Sight**
  - Paredes no 3D começarão a bloquear visão (Raycasting de Three.js).
  - `iluminacao` e `token_visoes`: Tokens seguram "tochas" iluminando o cenário de forma imersiva.
- [ ] **Marketplace e Biblioteca Avançada**
  - Transformar a primitiva em uma ferramenta de reuso comunitário: Implementar `asset_versions`, colecionadores com `asset_collections`, e busca profunda por `asset_tags` e metadados de licenças de direitos autorais.
- [ ] **Áudio Espacial e Playlists**
  - Trilhas sonoras para a mesa toda: `sons`, `playlists` em broadcast de áudio e efeitos disparados por magias na barra de atalhos.
- [ ] **Handouts de Imagem e Journals (Lore)**
  - O famoso Painel de Lore das mesas RPG: `journals`, `handouts` com imagens que o Mestre distribui no meio de combate e `pastas` visuais de investigação.
- [ ] **Moderação de Mesa e Auditoria**
  - `x_cards` anônimos para gatilhos sensíveis de roleplay.
  - Tracker de logs avançado com `auditoria_eventos` e consentimentos do mestre.

---

## 🛠️ Tecnologias, Bibliotecas e Metodologias

Este projeto adota uma arquitetura modular moderna, dividindo um Front-end rico focado em renderização WebGL, e um Back-end de altíssima performance para concorrência em tempo real.

### Metodologias
- **RBAC (Role-Based Access Control):** Controle rigoroso de permissões (`Mestre` vs `Jogador` vs `Espectador`) aplicado tanto nas regras do Cliente quanto no RLS (Row Level Security) do banco de dados, para garantir que ações sensíveis (ex: ver a ficha de um monstro oculto) nunca alcancem endpoints não autorizados.
- **Comunicação por WebSockets:** Mantém conexões persistentes abertas entre os jogadores, para reflexo de movimentação 3D, chat interativo de dados e alterações vitais no exato milissegundo de acontecimento.
- **Single Source of Truth Sincronizado:** O estado local reflete o banco; ações feitas desativam colisões conflitantes com eventos validados pelo servidor.

### Backend (Banco de Dados e API)
- **Supabase:** Nossa plataforma BaaS (Backend-as-a-Service) que entrega o **PostgreSQL** poderoso (com suporte nativo ao JSONB que decidimos usar nas fichas) além dos módulos vitais de Autenticação de Usuários e Storage de arquivos (para guardar os Assets 3D `.glb` ou mapas em `.png`).
- **Prisma (ORM):** Modelagem de dados fluída, limpa, declarativa e tipagem estrita (via TypeScript/Node). Facilita na hora de interagir estruturadamente com as tabelas do PostgreSQL do Supabase.
- **NestJS (com Fastify Adapter & WebSockets):** Framework Node.js robusto e progressivo com forte arquitetura orientada a módulos e injeção de dependências (inspirada no Angular). Configurado para rodar sobre o **Fastify** como motor HTTP, unindo uma organização estrutural impecável com performance extrema para as rotas da API e eventos em tempo real do VTT. Sincroniza perfeitamente com o Prisma ORM.

### Frontend (Já instaladas e rodando)
- **React (Via Vite):** A fundação do ecossistema reativo do Dashboard, Menus e Paineis.
- **Zustand:** Gerenciamento do Estado Global (inventário, turno atual, posição das miniaturas), lidando rápido com a sincronia da placa (Board) sem o excesso de boilerplate do Redux. Pode ser linkado lindamente com middlewares do WebSocket para enviar alterações.
- **Three.js (`three`):** A máquina WebGL de fato responsável pelo motor gerador do ambiente 3D no navegador.
- **React Three Fiber (`@react-three/fiber`):** Empacotador/Conciliador que nos deixa desenhar cenas complexas WebGL (Canvas, lights, groups, meshes) em forma de componentes React nativos interligados ao state.
- **React Three Drei (`@react-three/drei`):** O canivete suíço de hooks mágicos do WebGL. Nos permite importar a Câmera Orbital (`OrbitControls`), carregar texturas em planos (`useTexture`), arquivos .glb (`useGLTF`) e disparar animações tridimensionais das miniaturas (`useAnimations`).

---
*Roadmap gerado em conjunto com a arquitetura VTT discutida*
