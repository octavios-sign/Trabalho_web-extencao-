import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');
let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await open({ filename: dbPath, driver: sqlite3.Database });
  return dbInstance;
}

export async function initDb() {
  const db = await getDb();
  await db.run('PRAGMA foreign_keys = ON;');

  await db.exec(`CREATE TABLE IF NOT EXISTS ufs (id TEXT PRIMARY KEY, sigla TEXT UNIQUE NOT NULL, nome TEXT NOT NULL);`);
  await db.exec(`CREATE TABLE IF NOT EXISTS cidades (id TEXT PRIMARY KEY, uf_id TEXT NOT NULL, nome TEXT NOT NULL, FOREIGN KEY (uf_id) REFERENCES ufs(id) ON DELETE CASCADE);`);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY, nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL, telefone TEXT,
      perfil TEXT NOT NULL CHECK(perfil IN ('CLIENTE','TECNICO','SUPERVISOR','SUPERADMIN')),
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY, nome TEXT NOT NULL, descricao TEXT, icone TEXT DEFAULT '🔧'
    );`);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chamados (
      id TEXT PRIMARY KEY, titulo TEXT NOT NULL, descricao TEXT NOT NULL,
      categoria_id TEXT NOT NULL, cliente_id TEXT NOT NULL, tecnico_id TEXT,
      status TEXT NOT NULL DEFAULT 'ABERTO' CHECK(status IN ('ABERTO','EM_ATENDIMENTO','AGUARDANDO_CLIENTE','ENCERRADO')),
      prioridade TEXT NOT NULL DEFAULT 'MEDIA' CHECK(prioridade IN ('BAIXA','MEDIA','ALTA','CRITICA')),
      data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP, data_encerramento DATETIME,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL
    );`);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id TEXT PRIMARY KEY, chamado_id TEXT NOT NULL, usuario_id TEXT NOT NULL,
      conteudo TEXT NOT NULL, data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );`);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS metodos_pagamento (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      detalhes TEXT NOT NULL,
      padrao INTEGER DEFAULT 0,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );`);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_chamados_cliente ON chamados(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
    CREATE INDEX IF NOT EXISTS idx_mensagens_chamado ON mensagens(chamado_id);
    CREATE INDEX IF NOT EXISTS idx_metodos_pagamento_usuario ON metodos_pagamento(usuario_id);
  `);

  console.log('Database tables initialized.');

  const ufsCount = await db.get('SELECT COUNT(*) as count FROM ufs');
  if (ufsCount.count === 0) {
    for (const uf of [['1','SP','São Paulo'],['2','RJ','Rio de Janeiro'],['3','MG','Minas Gerais'],['4','BA','Bahia'],['5','PR','Paraná'],['6','RS','Rio Grande do Sul'],['7','SC','Santa Catarina'],['8','DF','Distrito Federal']]) {
      await db.run('INSERT INTO ufs (id,sigla,nome) VALUES (?,?,?)', uf);
    }
  }

  const cidadesCount = await db.get('SELECT COUNT(*) as count FROM cidades');
  if (cidadesCount.count === 0) {
    for (const c of [['c1','1','São Paulo'],['c2','1','Campinas'],['c3','2','Rio de Janeiro'],['c4','2','Niterói'],['c5','3','Belo Horizonte'],['c6','4','Salvador']]) {
      await db.run('INSERT INTO cidades (id,uf_id,nome) VALUES (?,?,?)', c);
    }
  }

  const usersCount = await db.get('SELECT COUNT(*) as count FROM usuarios');
  if (usersCount.count === 0) {
    const hash = await bcrypt.hash('123456', 10);
    for (const u of [
      ['1','João Cliente','cliente@teste.com',hash,'11999999999','CLIENTE'],
      ['2','Maria Técnica','tecnico@teste.com',hash,'11988888888','TECNICO'],
      ['3','Carlos Supervisor','supervisor@teste.com',hash,'11977777777','SUPERVISOR'],
      ['4','Ana Admin','admin@teste.com',hash,'11966666666','SUPERADMIN'],
    ]) {
      await db.run('INSERT INTO usuarios (id,nome,email,senha_hash,telefone,perfil) VALUES (?,?,?,?,?,?)', u);
    }
  }

  const catCount = await db.get('SELECT COUNT(*) as count FROM categorias');
  if (catCount.count === 0) {
    for (const c of [
      ['cat1','Formatação e Reinstalação','Formatação de PCs e reinstalação de SO.','💻'],
      ['cat2','Hardware e Periféricos','Diagnóstico e troca de peças e periféricos.','🖥️'],
      ['cat3','Rede e Internet','Roteadores, Wi-Fi, VPN e conectividade.','🌐'],
      ['cat4','Desenvolvimento de Software','Erros em sistemas e integração de apps.','⚙️'],
      ['cat5','Segurança Digital','Remoção de vírus e configuração de antivírus.','🔒'],
      ['cat6','Suporte Geral','Outros problemas técnicos.','🔧'],
    ]) {
      await db.run('INSERT INTO categorias (id,nome,descricao,icone) VALUES (?,?,?,?)', c);
    }
  }

  console.log('Database seeding completed.');
}
