# TechHelp (Projeto ConectaServ)

Este é o repositório do projeto **TechHelp / ConectaServ**, uma plataforma completa de Helpdesk e suporte técnico sob demanda desenvolvida com React, TypeScript, Node.js, Express e banco de dados relacional SQLite.

## 📋 Pré-requisitos
- **Node.js** (Versão recomendada: LTS v20+)
- **npm** (incluso com o Node.js)

---

## 🚀 Como Rodar o Projeto

Para executar o sistema completo, você precisará rodar o **Backend** (servidor da API e banco de dados) e o **Frontend** (interface web) simultaneamente. Siga as etapas abaixo:

### 1. Iniciar o Backend (API & SQLite)
O backend gerencia as regras de negócio, autenticação JWT e armazena os dados em um banco relacional SQLite local que é criado e populado automaticamente na primeira execução.

1. Abra um terminal na pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O servidor do backend estará rodando na porta **5000** (`http://localhost:5000`).*

---

### 2. Iniciar o Frontend (Vite + React)
A interface web desenvolvida com componentes React customizados e estilização em CSS moderno.

1. Abra um segundo terminal na pasta raiz do projeto (`Techelp`).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor local:
   ```bash
   npm run dev
   ```
   *O frontend abrirá automaticamente ou estará disponível no endereço: **`http://localhost:5173/`**.*

---

## 🔑 Contas de Testes Disponíveis
Ao iniciar o backend pela primeira vez, o banco de dados é automaticamente populado com as seguintes contas padrão de teste (todas utilizam a senha **`123456`**):

| Perfil de Acesso | E-mail de Login | Senha | Descrição |
| :--- | :--- | :--- | :--- |
| **Cliente** | `cliente@teste.com` | `123456` | Acesso ao Painel do Cliente (abre chamados, adiciona métodos de pagamento e simula checkout). |
| **Técnico** | `tecnico@teste.com` | `123456` | Acesso ao Painel do Técnico (visualiza e aceita chamados disponíveis, muda disponibilidade). |
| **Supervisor** | `supervisor@teste.com` | `123456` | Monitora chamados e técnicos ativos no sistema. |
| **Admin** | `admin@teste.com` | `123456` | Painel Administrativo Geral (CRUD de usuários e gerenciamento de UFs/Estados). |

---

## 🛠️ Novas Funcionalidades Implementadas
- **💳 Métodos de Pagamento:** Página premium e exclusiva no painel do cliente para gerenciar cartões de crédito e Pix, salvos no banco SQLite.
- **⚡ Simulador de Checkout:** Seção interativa para simular o pagamento e contratação de pacotes com um clique.
- **🎉 Página de Sucesso:** Página "Obrigado pela sua compra!" estilizada e com redirecionamentos após pagamentos bem sucedidos.
- **🔗 Integração com Categorias Dinâmicas:** Abertura de chamados carregando categorias reais cadastradas diretamente do SQL do backend.
