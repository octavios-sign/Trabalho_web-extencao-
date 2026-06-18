# TechHelp - Marketplace de Suporte Técnico Sob Demanda

TechHelp é uma plataforma de suporte técnico sob demanda, similar ao iFood, que conecta clientes que precisam de ajuda técnica com técnicos especializados disponíveis.

## 🎯 Transformação Realizada

O projeto foi transformado de um **portal de notícias** para um **marketplace de suporte técnico**.

### Principais Mudanças

#### 1. **Banco de Dados** (`tech_DB.sql`)
- ❌ Removido: Tabelas `noticias`, `comentarios`, `tags`
- ✅ Adicionado:
  - `tecnicos` - Perfil de técnicos com experiência, rating, documentos
  - `chamados` - Requisições de suporte (cliente, técnico, status, prioridade)
  - `mensagens_chat` - Chat em tempo real
  - `avaliacoes` - Sistema de rating (1-5 stars)
  - `especialidades_tecnico` - Áreas de atuação
  - `disponibilidade_tecnico` - Horários de trabalho

#### 2. **Perfis de Usuário** (`types/index.ts`)
- **CLIENTE** - Requisita suporte, acompanha chamados, avalia técnicos
- **TECNICO** (novo) - Oferece serviços, aceita chamados, recebe avaliações
- **SUPERVISOR** - Gerencia múltiplos técnicos
- **SUPERADMIN** - Administra plataforma

#### 3. **Interface de Usuário**

**HomePage** - Agora funciona como um marketplace
- Busca e filtro de técnicos por categoria
- Cards de técnicos com rating e experiência
- CTAs diferenciados para cliente vs técnico

**PainelCliente** (`pages/publico/PainelCliente.tsx`)
- Dashboard com estatísticas de chamados
- Abrir novo chamado com categoria e prioridade
- Listar técnicos disponíveis
- Chat com técnico em tempo real
- Avaliar técnico após conclusão

**PainelTecnico** (`pages/publico/PainelTecnico.tsx`)
- Dashboard com chamados disponíveis
- Toggle online/offline
- Aceitar chamados de interesse
- Chat com cliente
- Perfil com especialidades e avaliações
- Histórico de ganhos

**PainelSupervisor** (`pages/publico/PainelSupervisor.tsx`)
- Monitorar técnicos e seu desempenho
- Estatísticas de chamados
- Relatórios

#### 4. **Fluxo de Uso**

```
CLIENTE:
  1. Registra como cliente
  2. Cria chamado (título, descrição, categoria, prioridade)
  3. Sistema oferece técnicos disponíveis
  4. Entra em chat com técnico
  5. Técnico resolve o problema
  6. Cliente avalia (1-5 stars + comentário)
  7. Técnico recebe pagamento

TÉCNICO:
  1. Registra como técnico + upload de documentos
  2. Define especialidades e disponibilidade
  3. Vê chamados disponíveis em suas áreas
  4. Aceita chamado que o interessa
  5. Entra em chat com cliente
  6. Resolve problema
  7. Recebe avaliação do cliente
  8. Acumula ganhos
```

## 📊 Categorias de Suporte

- 🌐 **Redes** - Configuração e troubleshooting de redes
- 🔒 **Segurança** - Segurança, antivírus e proteção
- 💻 **Hardware** - Problemas com computadores e periféricos
- ⚙️ **Software** - Instalação e suporte de aplicativos
- 💾 **Backup** - Backup e recuperação de dados
- 🖨️ **Impressoras** - Instalação e configuração

## 🏗️ Estrutura de Arquivos

```
src/
├── types/
│   └── index.ts           # Types: Usuario, Tecnico, Chamado, MensagemChat, Avaliacao
├── pages/
│   ├── publico/
│   │   ├── HomePage.tsx           # Marketplace com busca de técnicos
│   │   ├── LoginPage.tsx          # Login
│   │   ├── RegisterPage.tsx       # Registro (cliente vs técnico)
│   │   ├── PainelCliente.tsx      # Dashboard do cliente
│   │   ├── PainelTecnico.tsx      # Dashboard do técnico
│   │   └── PainelSupervisor.tsx   # Dashboard do supervisor
│   └── superadmin/
│       └── PainelAdmin.tsx        # Admin dashboard
├── App.tsx                # Rotas principais
└── tech_DB.sql           # Schema do banco de dados
```

## 🚀 Próximas Etapas

- [ ] Chat em tempo real (WebSocket)
- [ ] Sistema de pagamento
- [ ] Notificações em tempo real
- [ ] Avaliações e comentários
- [ ] Histórico de técnico
- [ ] Filtros e busca avançada
- [ ] Integração com documentos (KYC para técnicos)
- [ ] Sistema de pontos/reputação

## 🔧 Como Usar

### Usuários Teste

```sql
-- Cliente
Email: cliente@teste.com
Senha: 123456
Perfil: CLIENTE

-- Técnico
Email: tecnico@teste.com
Senha: 123456
Perfil: TECNICO

-- Supervisor
Email: supervisor@teste.com
Senha: 123456
Perfil: SUPERVISOR

-- Admin
Email: admin@teste.com
Senha: 123456
Perfil: SUPERADMIN
```

### Executar

```bash
npm install
npm run dev
```

## 📝 Notas Técnicas

- Frontend: React 19 + TypeScript + React Router v7
- Estilos: CSS-in-JS com CSS Variables
- Banco: SQLite (tech_DB.sql)
- Build: Vite + TypeScript

---

**TechHelp v1.0** - Marketplace de Suporte Técnico Sob Demanda
