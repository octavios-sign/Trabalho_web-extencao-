# 🛡️ TECHELP - ESTRUTURA FINAL DO PROJETO

## 📂 Árvore de Arquivos (Principais)

```
techelp/
├── 📄 tech_DB.sql                          ✅ Schema completo do marketplace
├── 📄 TECHELP_REDESIGN.md                  ✅ Documentação detalhada
├── 📄 TRANSFORMACAO_RESUMO.md              ✅ Resumo executivo
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
│
├── src/
│   ├── 📄 App.tsx                          ✅ Rotas atualizadas
│   ├── 📄 main.tsx
│   ├── 📄 App.css
│   ├── 📄 index.css
│   │
│   ├── types/
│   │   └── 📄 index.ts                     ✅ Types: Usuario, Tecnico, Chamado, etc
│   │
│   ├── services/
│   │   ├── 📄 api.ts                       (manter existente com novas chamadas)
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── assets/
│   │
│   ├── pages/
│   │   ├── publico/
│   │   │   ├── 📄 HomePage.tsx             ✅ Marketplace de técnicos
│   │   │   ├── 📄 LoginPage.tsx            (manter existente)
│   │   │   ├── 📄 RegisterPage.tsx         (adaptar para cliente vs técnico)
│   │   │   ├── 📄 NotFoundPage.tsx         (manter)
│   │   │   ├── 📄 PainelCliente.tsx        ✅ NOVO - Dashboard cliente
│   │   │   ├── 📄 PainelTecnico.tsx        ✅ NOVO - Dashboard técnico
│   │   │   └── 📄 PainelSupervisor.tsx     ✅ NOVO - Dashboard supervisor
│   │   │
│   │   ├── superadmin/
│   │   │   └── 📄 PainelAdmin.tsx          (adaptar para novo schema)
│   │   │
│   │   ├── autor/                          ❌ (deprecated - era para AUTOR)
│   │   ├── editor/                         ❌ (deprecated - era para EDITOR)
│   │
│   └── data/
│       └── (dados estáticos se houver)
│
└── public/
    └── (assets estáticos)
```

---

## 🎭 Fluxo de Rotas

### Públicas
```
/                          → HomePage (marketplace)
/login                     → LoginPage
/register                  → RegisterPage (novo: chooser cliente vs técnico)
*                          → NotFoundPage
```

### Protegidas por Autenticação

#### Cliente
```
/cliente/                  → Dashboard
/cliente/abrir-chamado     → Novo chamado
/cliente/tecnicos          → Listar técnicos
/cliente/tecnico/:id       → Detalhes técnico
/cliente/chamado/:id       → Detalhes chamado + chat
/cliente/avaliacoes        → Minhas avaliações
```

#### Técnico
```
/tecnico/                  → Dashboard (chamados disponíveis)
/tecnico/chamados          → Meus chamados
/tecnico/chamado/:id       → Detalhes + chat
/tecnico/perfil            → Meu perfil (especialidades, rating)
/tecnico/avaliacoes        → Avaliações que recebi
/tecnico/ganhos            → Histórico de ganhos
```

#### Supervisor
```
/supervisor/               → Dashboard
/supervisor/tecnicos       → Monitorar técnicos
/supervisor/chamados       → Monitorar chamados
/supervisor/relatorios     → Relatórios e analytics
```

#### Admin
```
/admin/                    → Dashboard administrativo
```

---

## 🗄️ Schema do Banco de Dados (Resumo)

### Tabelas Principais

#### usuarios
```sql
id VARCHAR(50) PRIMARY KEY
nome VARCHAR(255) NOT NULL
email VARCHAR(255) UNIQUE
senha_hash VARCHAR(255)
perfil VARCHAR(20) CHECK IN ('CLIENTE', 'TECNICO', 'SUPERVISOR', 'SUPERADMIN')
telefone VARCHAR(20)
uf_id VARCHAR(50) FK → ufs
cidade_id VARCHAR(50) FK → cidades
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### tecnicos
```sql
id VARCHAR(50) PRIMARY KEY
usuario_id VARCHAR(50) UNIQUE FK → usuarios
documento VARCHAR(20)
documento_validado BOOLEAN DEFAULT 0
experiencia_anos INTEGER
taxa_comissao DECIMAL(5,2) DEFAULT 20.0
descricao TEXT
foto_url VARCHAR(500)
rating_medio DECIMAL(3,2) DEFAULT 5.0
total_avaliacoes INTEGER DEFAULT 0
chamados_concluidos INTEGER DEFAULT 0
disponivel BOOLEAN DEFAULT 0
data_criacao TIMESTAMP
```

#### chamados
```sql
id VARCHAR(50) PRIMARY KEY
cliente_id VARCHAR(50) NOT NULL FK → usuarios
tecnico_id VARCHAR(50) FK → tecnicos (NULL = não atribuído)
categoria VARCHAR(100) NOT NULL
titulo VARCHAR(255) NOT NULL
descricao TEXT NOT NULL
prioridade VARCHAR(20) DEFAULT 'NORMAL' CHECK IN ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE')
status VARCHAR(20) NOT NULL CHECK IN ('ABERTO', 'ACEITO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO', 'CANCELADO')
tempo_estimado_horas INTEGER
valor_proposto DECIMAL(10,2)
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
data_inicio TIMESTAMP
data_conclusao TIMESTAMP
```

#### mensagens_chat
```sql
id VARCHAR(50) PRIMARY KEY
chamado_id VARCHAR(50) NOT NULL FK → chamados
usuario_id VARCHAR(50) NOT NULL FK → usuarios
conteudo TEXT NOT NULL
tipo_anexo VARCHAR(50)
url_anexo VARCHAR(500)
data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
lida BOOLEAN DEFAULT 0
```

#### avaliacoes
```sql
id VARCHAR(50) PRIMARY KEY
chamado_id VARCHAR(50) NOT NULL UNIQUE FK → chamados
cliente_id VARCHAR(50) NOT NULL FK → usuarios
tecnico_id VARCHAR(50) NOT NULL FK → tecnicos
rating INTEGER NOT NULL CHECK (1 TO 5)
comentario TEXT
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### especialidades_tecnico
```sql
id VARCHAR(50) PRIMARY KEY
tecnico_id VARCHAR(50) NOT NULL FK → tecnicos
categoria VARCHAR(100) NOT NULL
prioridade INTEGER DEFAULT 1
```

#### disponibilidade_tecnico
```sql
id VARCHAR(50) PRIMARY KEY
tecnico_id VARCHAR(50) NOT NULL FK → tecnicos
dia_semana VARCHAR(20)
hora_inicio VARCHAR(5)
hora_fim VARCHAR(5)
ativo BOOLEAN DEFAULT 1
```

---

## 🎨 Mudanças de UI/UX

### HomePage (Antes vs Depois)

```
ANTES:
┌─────────────────────────────────────┐
│      Portal de Notícias             │
├─────────────────────────────────────┤
│  Últimas Notícias                   │
│  [ Artigo 1 ]  [ Artigo 2 ]        │
│  [ Artigo 3 ]  [ Artigo 4 ]        │
└─────────────────────────────────────┘

DEPOIS:
┌─────────────────────────────────────┐
│   Marketplace de Técnicos           │
├─────────────────────────────────────┤
│  Buscar Técnico por Categoria      │
│  [ 🌐 Redes ] [ 🔒 Segurança ]    │
│  [ 💻 Hardware ] [ ⚙️ Software ]   │
├─────────────────────────────────────┤
│  Técnicos em Destaque               │
│  ┌─────────┐  ┌─────────┐          │
│  │ 👨‍💻      │  │ 👨‍💻      │          │
│  │ João    │  │ Maria   │          │
│  │ ⭐ 4.8  │  │ ⭐ 4.9  │          │
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘
```

### Dashboard Cliente (Novo)

```
┌────────────┬─────────────────────────┐
│            │                         │
│  MENU      │     CONTEÚDO PRINCIPAL  │
│  📊 Dash   │  ┌───────────────────┐  │
│  ➕ Novo   │  │  Dashboard        │  │
│  👨‍💻 Técns  │  │  Total: 5 chamados│  │
│  ⭐ Aval   │  ├───────────────────┤  │
│  🚪 Sair   │  │ Chamados Abertos  │  │
│            │  │ [Card][Card][Crd] │  │
│            │  └───────────────────┘  │
│            │                         │
└────────────┴─────────────────────────┘
```

### Dashboard Técnico (Novo)

```
┌────────────┬─────────────────────────┐
│            │                         │
│  MENU      │     CONTEÚDO PRINCIPAL  │
│  📊 Dash   │  ┌───────────────────┐  │
│  📋 Meus   │  │  Chamados Dispon. │  │
│  👤 Perfil │  │  [🎫] Redes       │  │
│  ⭐ Aval   │  │  [🎫] Segurança   │  │
│  💰 Ganhos │  │  [🎫] Hardware    │  │
│  🚪 Sair   │  └───────────────────┘  │
│            │  🟢 Disponível (toggle) │
│            │                         │
└────────────┴─────────────────────────┘
```

---

## 🔐 Segurança & Autenticação

```
Login com email/senha (Bcrypt)
├── Valida credenciais
├── Retorna JWT/Token
├── Armazena em localStorage
└── Cada requisição envia token

Proteção de rotas:
├── /cliente/* → redir se perfil ≠ CLIENTE
├── /tecnico/* → redir se perfil ≠ TECNICO
├── /supervisor/* → redir se perfil ≠ SUPERVISOR
└── /admin/* → redir se perfil ≠ SUPERADMIN
```

---

## 📊 Estatísticas Rastreadas

### Técnico
```
- Chamados concluídos (count)
- Rating médio (1-5)
- Total de avaliações (count)
- Disponibilidade (online/offline)
- Experiência (anos)
- Taxa de conclusão (%)
```

### Cliente
```
- Total de chamados abertos
- Chamados em andamento
- Chamados resolvidos
- Técnicos favoritos (futura feature)
```

### Plataforma
```
- Total de chamados
- Taxa de resolução (%)
- Tempo médio de resposta
- Rating médio de técnicos
- Número de técnicos ativos
```

---

## 🚀 Como Iniciar

### 1. Setup
```bash
cd techelp
npm install
```

### 2. Inicializar BD (se necessário)
```bash
# Executar tech_DB.sql em seu SGBD
sqlite3 tech.db < tech_DB.sql
```

### 3. Rodar desenvolvimento
```bash
npm run dev
# Acesso: http://localhost:5173
```

### 4. Build produção
```bash
npm run build
npm run preview
```

---

## 📋 Checklist de Implementação

```
✅ Schema BD
✅ Types TypeScript
✅ HomePage redesenhada
✅ PainelCliente
✅ PainelTecnico
✅ PainelSupervisor
✅ Rotas atualizadas
⏳ Chat em tempo real (WebSocket)
⏳ Sistema de pagamento
⏳ Notificações push
⏳ Avaliações completas
⏳ RegisterPage (bifurcação cliente/técnico)
⏳ API endpoints (backend)
```

---

**Documentação - TechHelp v1.0 (Transformação para Marketplace)**
Última atualização: 2026-05-27
