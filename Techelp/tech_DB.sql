-- ====================================================================
-- BANCO DE DADOS: tech_DB
-- PROJETO: TechHelp (Marketplace de Suporte Técnico)
-- ====================================================================

-- Habilitar integridade referencial para SQLite (se aplicável)
PRAGMA foreign_keys = ON;

-- ====================================================================
-- SEÇÃO 1: ESTRUTURA DAS TABELAS (DDL - Data Definition Language)
-- ====================================================================

-- Tabela: ufs (Estados)
CREATE TABLE IF NOT EXISTS ufs (
    id VARCHAR(50) PRIMARY KEY,
    sigla VARCHAR(2) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL
);

-- Tabela: cidades
CREATE TABLE IF NOT EXISTS cidades (
    id VARCHAR(50) PRIMARY KEY,
    uf_id VARCHAR(50) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    FOREIGN KEY (uf_id) REFERENCES ufs(id) ON DELETE CASCADE
);

-- Tabela: usuarios (Base para Cliente, Técnico, Supervisor, Admin)
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    perfil VARCHAR(20) NOT NULL CHECK(perfil IN ('CLIENTE', 'TECNICO', 'SUPERVISOR', 'SUPERADMIN')),
    uf_id VARCHAR(50),
    cidade_id VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uf_id) REFERENCES ufs(id) ON DELETE SET NULL,
    FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON DELETE SET NULL
);

-- Tabela: tecnicos (Perfil estendido para técnicos)
CREATE TABLE IF NOT EXISTS tecnicos (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50) NOT NULL UNIQUE,
    documento VARCHAR(20) NOT NULL,
    documento_validado BOOLEAN DEFAULT 0,
    experiencia_anos INTEGER DEFAULT 0,
    taxa_comissao DECIMAL(5,2) DEFAULT 20.0, -- Percentual que a plataforma fica
    descricao TEXT,
    foto_url VARCHAR(500),
    rating_medio DECIMAL(3,2) DEFAULT 5.0,
    total_avaliacoes INTEGER DEFAULT 0,
    chamados_concluidos INTEGER DEFAULT 0,
    disponivel BOOLEAN DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela: especialidades_tecnico (Quais áreas cada técnico atua)
CREATE TABLE IF NOT EXISTS especialidades_tecnico (
    id VARCHAR(50) PRIMARY KEY,
    tecnico_id VARCHAR(50) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    prioridade INTEGER DEFAULT 1,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
);

-- Tabela: chamados (Requisições de suporte)
CREATE TABLE IF NOT EXISTS chamados (
    id VARCHAR(50) PRIMARY KEY,
    cliente_id VARCHAR(50) NOT NULL,
    tecnico_id VARCHAR(50),
    categoria VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'NORMAL' CHECK(prioridade IN ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE')),
    status VARCHAR(20) NOT NULL CHECK(status IN ('ABERTO', 'ACEITO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO', 'CANCELADO')),
    tempo_estimado_horas INTEGER,
    valor_proposto DECIMAL(10,2),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_inicio TIMESTAMP,
    data_conclusao TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE SET NULL
);

-- Tabela: mensagens_chat (Comunicação em tempo real)
CREATE TABLE IF NOT EXISTS mensagens_chat (
    id VARCHAR(50) PRIMARY KEY,
    chamado_id VARCHAR(50) NOT NULL,
    usuario_id VARCHAR(50) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo_anexo VARCHAR(50),
    url_anexo VARCHAR(500),
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT 0,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela: avaliacoes (Cliente avalia Técnico)
CREATE TABLE IF NOT EXISTS avaliacoes (
    id VARCHAR(50) PRIMARY KEY,
    chamado_id VARCHAR(50) NOT NULL UNIQUE,
    cliente_id VARCHAR(50) NOT NULL,
    tecnico_id VARCHAR(50) NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comentario TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
);

-- Tabela: disponibilidade_tecnico (Controle de horário online/offline)
CREATE TABLE IF NOT EXISTS disponibilidade_tecnico (
    id VARCHAR(50) PRIMARY KEY,
    tecnico_id VARCHAR(50) NOT NULL,
    dia_semana VARCHAR(20),
    hora_inicio VARCHAR(5),
    hora_fim VARCHAR(5),
    ativo BOOLEAN DEFAULT 1,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
);

-- Criando Índices para otimização
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_chamados_cliente ON chamados(cliente_id);
CREATE INDEX IF NOT EXISTS idx_chamados_tecnico ON chamados(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_chamado ON mensagens_chat(chamado_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_tecnico ON avaliacoes(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_especialidades_tecnico ON especialidades_tecnico(tecnico_id);


-- ====================================================================
-- SEÇÃO 2: INSERÇÃO DE DADOS INICIAIS (DML - Data Manipulation Language)
-- ====================================================================

-- Inserindo UFs (Estados)
INSERT INTO ufs (id, sigla, nome) VALUES 
('1', 'SP', 'São Paulo'),
('2', 'RJ', 'Rio de Janeiro'),
('3', 'MG', 'Minas Gerais'),
('4', 'BA', 'Bahia'),
('5', 'PR', 'Paraná'),
('6', 'RS', 'Rio Grande do Sul'),
('7', 'SC', 'Santa Catarina'),
('8', 'DF', 'Distrito Federal')
ON CONFLICT(id) DO NOTHING;

-- Inserindo Cidades
INSERT INTO cidades (id, uf_id, nome) VALUES 
('c1', '1', 'São Paulo'),
('c2', '1', 'Campinas'),
('c3', '2', 'Rio de Janeiro'),
('c4', '2', 'Niterói'),
('c5', '3', 'Belo Horizonte'),
('c6', '4', 'Salvador')
ON CONFLICT(id) DO NOTHING;

-- Inserindo Usuários Padrão do Sistema
-- Nota: A senha de todos é '123456' (Bcrypt)
INSERT INTO usuarios (id, nome, email, senha_hash, telefone, perfil, uf_id, cidade_id) VALUES 
('1', 'João Cliente', 'cliente@teste.com', '$2a$10$T8Z.G6yYQ/bM1Q2g7L9C6.bJ9V23dO2G9aQ12v4m4U9n5B6u1Z2dG', '11999999999', 'CLIENTE', '1', 'c1'),
('2', 'Maria Técnico', 'tecnico@teste.com', '$2a$10$T8Z.G6yYQ/bM1Q2g7L9C6.bJ9V23dO2G9aQ12v4m4U9n5B6u1Z2dG', '11988888888', 'TECNICO', '1', 'c1'),
('3', 'Carlos Supervisor', 'supervisor@teste.com', '$2a$10$T8Z.G6yYQ/bM1Q2g7L9C6.bJ9V23dO2G9aQ12v4m4U9n5B6u1Z2dG', '11977777777', 'SUPERVISOR', '1', 'c1'),
('4', 'Ana Admin', 'admin@teste.com', '$2a$10$T8Z.G6yYQ/bM1Q2g7L9C6.bJ9V23dO2G9aQ12v4m4U9n5B6u1Z2dG', '11966666666', 'SUPERADMIN', '1', 'c1')
ON CONFLICT(id) DO NOTHING;

-- Inserindo Perfil de Técnico
INSERT INTO tecnicos (id, usuario_id, documento, documento_validado, experiencia_anos, descricao, rating_medio, disponivel) VALUES 
('tech1', '2', '12345678901', 1, 5, 'Especialista em redes e segurança com 5 anos de experiência', 4.8, 1)
ON CONFLICT(id) DO NOTHING;

-- Inserindo Especialidades do Técnico
INSERT INTO especialidades_tecnico (id, tecnico_id, categoria, prioridade) VALUES 
('esp1', 'tech1', 'Redes', 1),
('esp2', 'tech1', 'Segurança', 1),
('esp3', 'tech1', 'Hardware', 2)
ON CONFLICT(id) DO NOTHING;

-- Inserindo Disponibilidade do Técnico
INSERT INTO disponibilidade_tecnico (id, tecnico_id, dia_semana, hora_inicio, hora_fim, ativo) VALUES 
('disp1', 'tech1', 'SEGUNDA', '09:00', '18:00', 1),
('disp2', 'tech1', 'TERCA', '09:00', '18:00', 1),
('disp3', 'tech1', 'QUARTA', '09:00', '18:00', 1),
('disp4', 'tech1', 'QUINTA', '09:00', '18:00', 1),
('disp5', 'tech1', 'SEXTA', '09:00', '18:00', 1)
ON CONFLICT(id) DO NOTHING;

-- ====================================================================
-- SEÇÃO 3: EXEMPLOS DE COMANDOS ÚTEIS
-- ====================================================================

-- Listar técnicos disponíveis por categoria:
-- SELECT t.*, u.nome, u.email FROM tecnicos t
-- JOIN usuarios u ON t.usuario_id = u.id
-- WHERE t.disponivel = 1
-- AND t.usuario_id IN (
--     SELECT DISTINCT tecnico_id FROM especialidades_tecnico 
--     WHERE categoria = 'Redes'
-- );

-- Listar chamados abertos:
-- SELECT * FROM chamados WHERE status IN ('ABERTO', 'ACEITO', 'EM_ANDAMENTO');

-- Buscar avaliações de um técnico:
-- SELECT AVG(rating) as rating_medio, COUNT(*) as total FROM avaliacoes WHERE tecnico_id = 'tech1';
