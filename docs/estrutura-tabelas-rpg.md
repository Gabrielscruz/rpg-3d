# Estrutura das tabelas do banco RPG

Documento com a estrutura completa sugerida para um RPG estilo D&D com RBAC simples, mesas, personagens, mapas, inventário, sessões e rolagens.

## Núcleo de acesso

### users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_login_em TIMESTAMP NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### roles
```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    fixo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### permissions
```sql
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    recurso VARCHAR(50) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### user_roles
```sql
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role_id)
);
```

### role_permissions
```sql
CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, permission_id)
);
```

## Mesas e jogadores

### mesas
```sql
CREATE TABLE mesas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    sistema VARCHAR(50) NOT NULL DEFAULT 'D&D 5e',
    codigo_convite VARCHAR(30) UNIQUE,
    mestre_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    max_jogadores INT,
    publica BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ativa',
    capa_url TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### mesa_users
```sql
CREATE TABLE mesa_users (
    id BIGSERIAL PRIMARY KEY,
    mesa_id BIGINT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    papel_na_mesa VARCHAR(30) NOT NULL DEFAULT 'jogador',
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    entrou_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    saiu_em TIMESTAMP NULL,
    UNIQUE (mesa_id, user_id)
);
```

### sessoes
```sql
CREATE TABLE sessoes (
    id BIGSERIAL PRIMARY KEY,
    mesa_id BIGINT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    titulo VARCHAR(120) NOT NULL,
    descricao TEXT,
    numero_sessao INT,
    iniciada_em TIMESTAMP NULL,
    encerrada_em TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'planejada',
    resumo TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Personagens

### personagens
```sql
CREATE TABLE personagens (
    id BIGSERIAL PRIMARY KEY,
    mesa_id BIGINT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    owner_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    nome VARCHAR(120) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'pc',
    raca VARCHAR(50),
    classe VARCHAR(50),
    subclasse VARCHAR(50),
    background VARCHAR(50),
    alinhamento VARCHAR(30),
    nivel INT NOT NULL DEFAULT 1,
    experiencia INT NOT NULL DEFAULT 0,
    hp_atual INT NOT NULL DEFAULT 10,
    hp_maximo INT NOT NULL DEFAULT 10,
    ca INT NOT NULL DEFAULT 10,
    deslocamento INT NOT NULL DEFAULT 9,
    iniciativa_bonus INT NOT NULL DEFAULT 0,
    forca INT NOT NULL DEFAULT 10,
    destreza INT NOT NULL DEFAULT 10,
    constituicao INT NOT NULL DEFAULT 10,
    inteligencia INT NOT NULL DEFAULT 10,
    sabedoria INT NOT NULL DEFAULT 10,
    carisma INT NOT NULL DEFAULT 10,
    inspiracao BOOLEAN NOT NULL DEFAULT FALSE,
    proficiencia_bonus INT NOT NULL DEFAULT 2,
    historia TEXT,
    retrato_url TEXT,
    token_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### personagem_pericias
```sql
CREATE TABLE personagem_pericias (
    id BIGSERIAL PRIMARY KEY,
    personagem_id BIGINT NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
    nome_pericia VARCHAR(50) NOT NULL,
    proficiente BOOLEAN NOT NULL DEFAULT FALSE,
    expertise BOOLEAN NOT NULL DEFAULT FALSE,
    bonus_extra INT NOT NULL DEFAULT 0,
    UNIQUE (personagem_id, nome_pericia)
);
```

### personagem_testes_resistencia
```sql
CREATE TABLE personagem_testes_resistencia (
    id BIGSERIAL PRIMARY KEY,
    personagem_id BIGINT NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
    atributo VARCHAR(30) NOT NULL,
    proficiente BOOLEAN NOT NULL DEFAULT FALSE,
    bonus_extra INT NOT NULL DEFAULT 0,
    UNIQUE (personagem_id, atributo)
);
```

### personagem_recursos
```sql
CREATE TABLE personagem_recursos (
    id BIGSERIAL PRIMARY KEY,
    personagem_id BIGINT NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
    nome VARCHAR(80) NOT NULL,
    valor_atual INT NOT NULL DEFAULT 0,
    valor_maximo INT NOT NULL DEFAULT 0,
    recarrega_em VARCHAR(30),
    descricao TEXT
);
```

## Itens e inventário

### itens
```sql
CREATE TABLE itens (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    subtipo VARCHAR(50),
    raridade VARCHAR(30),
    descricao TEXT,
    peso NUMERIC(10,2) NOT NULL DEFAULT 0,
    valor_moedas NUMERIC(10,2) NOT NULL DEFAULT 0,
    empilhavel BOOLEAN NOT NULL DEFAULT TRUE,
    equipavel BOOLEAN NOT NULL DEFAULT FALSE,
    slot_equipamento VARCHAR(30),
    bonus_ataque INT NOT NULL DEFAULT 0,
    bonus_dano INT NOT NULL DEFAULT 0,
    bonus_ca INT NOT NULL DEFAULT 0,
    propriedades JSONB,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### itens_personagem
```sql
CREATE TABLE itens_personagem (
    id BIGSERIAL PRIMARY KEY,
    personagem_id BIGINT NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES itens(id) ON DELETE RESTRICT,
    quantidade INT NOT NULL DEFAULT 1,
    equipado BOOLEAN NOT NULL DEFAULT FALSE,
    slot_ocupado VARCHAR(30),
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### mochilas_personagem
```sql
CREATE TABLE mochilas_personagem (
    id BIGSERIAL PRIMARY KEY,
    personagem_id BIGINT NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
    nome VARCHAR(80) NOT NULL DEFAULT 'Inventário',
    capacidade_peso NUMERIC(10,2),
    capacidade_slots INT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);
```

## Magias e habilidades

### magias
```sql
CREATE TABLE magias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    nivel INT NOT NULL DEFAULT 0,
    escola VARCHAR(50),
    tempo_conjuracao VARCHAR(50),
    alcance VARCHAR(50),
    componentes VARCHAR(50),
    duracao VARCHAR(50),
    descricao TEXT NOT NULL,
    ritual BOOLEAN NOT NULL DEFAULT FALSE,
    concentracao BOOLEAN NOT NULL DEFAULT FALSE,
    sistema VARCHAR(50) NOT NULL DEFAULT 'D&D 5e'
);
```

### personagem_magias
```sql
CREATE TABLE personagem_magias (
    id BIGSERIAL PRIMARY KEY,
    personagem_id BIGINT NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
    magia_id BIGINT NOT NULL REFERENCES magias(id) ON DELETE CASCADE,
    preparada BOOLEAN NOT NULL DEFAULT FALSE,
    favorita BOOLEAN NOT NULL DEFAULT FALSE,
    origem VARCHAR(50),
    UNIQUE (personagem_id, magia_id)
);
```

### habilidades
```sql
CREATE TABLE habilidades (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    origem VARCHAR(50)
);
```

### personagem_habilidades
```sql
CREATE TABLE personagem_habilidades (
    id BIGSERIAL PRIMARY KEY,
    personagem_id BIGINT NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
    habilidade_id BIGINT NOT NULL REFERENCES habilidades(id) ON DELETE CASCADE,
    UNIQUE (personagem_id, habilidade_id)
);
```

## Mapas e tokens

### mapas
```sql
CREATE TABLE mapas (
    id BIGSERIAL PRIMARY KEY,
    mesa_id BIGINT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    imagem_url TEXT NOT NULL,
    largura_px INT,
    altura_px INT,
    grid_ativa BOOLEAN NOT NULL DEFAULT TRUE,
    grid_tamanho INT NOT NULL DEFAULT 70,
    fog_of_war BOOLEAN NOT NULL DEFAULT FALSE,
    ordem INT NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### tokens_mapa
```sql
CREATE TABLE tokens_mapa (
    id BIGSERIAL PRIMARY KEY,
    mapa_id BIGINT NOT NULL REFERENCES mapas(id) ON DELETE CASCADE,
    personagem_id BIGINT NULL REFERENCES personagens(id) ON DELETE SET NULL,
    nome_exibicao VARCHAR(120),
    imagem_url TEXT,
    pos_x INT NOT NULL DEFAULT 0,
    pos_y INT NOT NULL DEFAULT 0,
    largura_grid INT NOT NULL DEFAULT 1,
    altura_grid INT NOT NULL DEFAULT 1,
    hp_visivel BOOLEAN NOT NULL DEFAULT TRUE,
    visivel_para_jogadores BOOLEAN NOT NULL DEFAULT TRUE,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    iniciativa INT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### anotacoes_mapa
```sql
CREATE TABLE anotacoes_mapa (
    id BIGSERIAL PRIMARY KEY,
    mapa_id BIGINT NOT NULL REFERENCES mapas(id) ON DELETE CASCADE,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    tipo VARCHAR(30) NOT NULL,
    conteudo TEXT,
    pos_x INT,
    pos_y INT,
    cor VARCHAR(20),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Chat, diário e rolagens

### mensagens_mesa
```sql
CREATE TABLE mensagens_mesa (
    id BIGSERIAL PRIMARY KEY,
    mesa_id BIGINT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    personagem_id BIGINT NULL REFERENCES personagens(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'texto',
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### rolagens_dado
```sql
CREATE TABLE rolagens_dado (
    id BIGSERIAL PRIMARY KEY,
    mesa_id BIGINT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    sessao_id BIGINT NULL REFERENCES sessoes(id) ON DELETE SET NULL,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    personagem_id BIGINT NULL REFERENCES personagens(id) ON DELETE SET NULL,
    formula VARCHAR(50) NOT NULL,
    resultado_total INT NOT NULL,
    detalhes JSONB,
    privada BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### diario_mesa
```sql
CREATE TABLE diario_mesa (
    id BIGSERIAL PRIMARY KEY,
    mesa_id BIGINT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    sessao_id BIGINT NULL REFERENCES sessoes(id) ON DELETE SET NULL,
    autor_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    conteudo TEXT NOT NULL,
    publico BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### logs_personagem
```sql
CREATE TABLE logs_personagem (
    id BIGSERIAL PRIMARY KEY,
    personagem_id BIGINT NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    descricao TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Arquivos

### arquivos
```sql
CREATE TABLE arquivos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    nome_original VARCHAR(255) NOT NULL,
    nome_armazenado VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    url TEXT NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Índices recomendados

```sql
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_mesa_users_mesa_id ON mesa_users(mesa_id);
CREATE INDEX idx_mesa_users_user_id ON mesa_users(user_id);
CREATE INDEX idx_personagens_mesa_id ON personagens(mesa_id);
CREATE INDEX idx_personagens_owner_user_id ON personagens(owner_user_id);
CREATE INDEX idx_itens_personagem_personagem_id ON itens_personagem(personagem_id);
CREATE INDEX idx_tokens_mapa_mapa_id ON tokens_mapa(mapa_id);
CREATE INDEX idx_mensagens_mesa_mesa_id ON mensagens_mesa(mesa_id);
CREATE INDEX idx_rolagens_dado_mesa_id ON rolagens_dado(mesa_id);
```

## Seeds iniciais de RBAC

```sql
INSERT INTO roles (nome, descricao) VALUES
('admin', 'Acesso total ao sistema'),
('mestre', 'Gerencia mesas, sessões, mapas e NPCs'),
('jogador', 'Controla personagens e participa das mesas');

INSERT INTO permissions (codigo, descricao, recurso, acao) VALUES
('mesa.create', 'Criar mesa', 'mesa', 'create'),
('mesa.update', 'Editar mesa', 'mesa', 'update'),
('mesa.delete', 'Excluir mesa', 'mesa', 'delete'),
('personagem.create', 'Criar personagem', 'personagem', 'create'),
('personagem.update', 'Editar personagem', 'personagem', 'update'),
('mapa.create', 'Criar mapa', 'mapa', 'create'),
('mapa.update', 'Editar mapa', 'mapa', 'update'),
('rolagem.create', 'Fazer rolagem', 'rolagem', 'create');
```
