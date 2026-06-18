// Migration script: converts news portal DB → tech support DB
// Run once with: node migrate.js
import { getDb } from './db.js';
import bcrypt from 'bcryptjs';

async function migrate() {
  const db = await getDb();
  console.log('Starting migration...');
  await db.run('PRAGMA foreign_keys = OFF');

  // 1. Drop old tables
  await db.run('DROP TABLE IF EXISTS comentarios');
  await db.run('DROP TABLE IF EXISTS noticias');
  console.log('Dropped old tables.');

  // 2. Migrate usuarios to new roles (recreate table)
  await db.run('ALTER TABLE usuarios RENAME TO usuarios_old');
  await db.exec(`
    CREATE TABLE usuarios (
      id TEXT PRIMARY KEY, nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL, telefone TEXT,
      perfil TEXT NOT NULL CHECK(perfil IN ('CLIENTE','TECNICO','SUPERVISOR','SUPERADMIN')),
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.run(`
    INSERT INTO usuarios (id, nome, email, senha_hash, telefone, perfil, data_criacao)
    SELECT id, nome, email, senha_hash, telefone,
      CASE perfil
        WHEN 'LEITOR' THEN 'CLIENTE'
        WHEN 'AUTOR'  THEN 'TECNICO'
        WHEN 'EDITOR' THEN 'SUPERVISOR'
        ELSE 'SUPERADMIN'
      END,
      data_criacao FROM usuarios_old
  `);
  await db.run('DROP TABLE usuarios_old');
  console.log('Migrated usuarios table to new roles.');

  // 3. Update seed user emails/names to match new system
  const hash = await bcrypt.hash('123456', 10);
  await db.run("UPDATE usuarios SET nome='João Cliente',    email='cliente@teste.com'    WHERE id='1'");
  await db.run("UPDATE usuarios SET nome='Maria Técnica',   email='tecnico@teste.com'    WHERE id='2'");
  await db.run("UPDATE usuarios SET nome='Carlos Supervisor',email='supervisor@teste.com' WHERE id='3'");
  console.log('Updated seed user emails.');

  // 4. Create new tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY, nome TEXT NOT NULL, descricao TEXT, icone TEXT DEFAULT '🔧'
    );
    CREATE TABLE IF NOT EXISTS chamados (
      id TEXT PRIMARY KEY, titulo TEXT NOT NULL, descricao TEXT NOT NULL,
      categoria_id TEXT NOT NULL, cliente_id TEXT NOT NULL, tecnico_id TEXT,
      status TEXT NOT NULL DEFAULT 'ABERTO' CHECK(status IN ('ABERTO','EM_ATENDIMENTO','AGUARDANDO_CLIENTE','ENCERRADO')),
      prioridade TEXT NOT NULL DEFAULT 'MEDIA' CHECK(prioridade IN ('BAIXA','MEDIA','ALTA','CRITICA')),
      data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP, data_encerramento DATETIME,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS mensagens (
      id TEXT PRIMARY KEY, chamado_id TEXT NOT NULL, usuario_id TEXT NOT NULL,
      conteudo TEXT NOT NULL, data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_chamados_cliente ON chamados(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
    CREATE INDEX IF NOT EXISTS idx_mensagens_chamado ON mensagens(chamado_id);
  `);
  console.log('Created new tables: categorias, chamados, mensagens.');

  // 5. Seed categories
  for (const c of [
    ['cat1','Formatação e Reinstalação','Formatação de PCs e reinstalação de SO.','💻'],
    ['cat2','Hardware e Periféricos','Diagnóstico e troca de peças e periféricos.','🖥️'],
    ['cat3','Rede e Internet','Roteadores, Wi-Fi, VPN e conectividade.','🌐'],
    ['cat4','Desenvolvimento de Software','Erros em sistemas e integração de apps.','⚙️'],
    ['cat5','Segurança Digital','Remoção de vírus e configuração de antivírus.','🔒'],
    ['cat6','Suporte Geral','Outros problemas técnicos.','🔧'],
  ]) {
    await db.run('INSERT OR IGNORE INTO categorias (id,nome,descricao,icone) VALUES (?,?,?,?)', c);
  }
  console.log('Seeded categorias.');

  await db.run('PRAGMA foreign_keys = ON');
  console.log('Migration complete! You can now restart the backend server.');
  process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
