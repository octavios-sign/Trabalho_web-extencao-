import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb, getDb } from './db.js';
import { authenticateToken, authorizeRoles, JWT_SECRET } from './authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>TechHelp Backend API</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 80px 20px; background: #0f172a; color: #f1f5f9;">
        <div style="max-width: 500px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          <span style="font-size: 48px;">🛡️</span>
          <h2 style="margin-top: 16px; margin-bottom: 8px;">TechHelp Backend</h2>
          <p style="color: #94a3b8; line-height: 1.5; margin-bottom: 24px;">O servidor de API e banco de dados SQLite está rodando corretamente.</p>
          <p style="margin-bottom: 8px; font-size: 14px; color: #94a3b8;">Para acessar a interface do usuário, abra:</p>
          <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 12px rgba(14,165,233,0.3);">
            Ir para o Frontend (http://localhost:5173)
          </a>
        </div>
      </body>
    </html>
  `);
});

// ── AUTH ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
  try {
    const db = await getDb();
    if (await db.get('SELECT id FROM usuarios WHERE email = ?', [email]))
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    const senha_hash = await bcrypt.hash(senha, 10);
    const id = generateId();
    await db.run(
      'INSERT INTO usuarios (id,nome,email,senha_hash,telefone,perfil) VALUES (?,?,?,?,?,?)',
      [id, nome, email, senha_hash, telefone || null, 'CLIENTE']
    );
    res.status(201).json({ message: 'Cadastro realizado com sucesso!', id });
  } catch (e) { res.status(500).json({ message: 'Erro ao cadastrar.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!user || !await bcrypt.compare(senha, user.senha_hash))
      return res.status(400).json({ message: 'E-mail ou senha incorretos.' });
    const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email, perfil: user.perfil }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, usuario: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil, telefone: user.telefone } });
  } catch (e) { res.status(500).json({ message: 'Erro ao fazer login.' }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id,nome,email,telefone,perfil,data_criacao FROM usuarios WHERE id=?', [req.user.id]);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(user);
  } catch (e) { res.status(500).json({ message: 'Erro ao obter perfil.' }); }
});

// ── CATEGORIAS ────────────────────────────────────────────────────────────────

app.get('/api/categorias', async (_req, res) => {
  try {
    const db = await getDb();
    res.json(await db.all('SELECT * FROM categorias ORDER BY nome ASC'));
  } catch (e) { res.status(500).json({ message: 'Erro ao listar categorias.' }); }
});

app.post('/api/admin/categorias', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  const { nome, descricao, icone } = req.body;
  if (!nome) return res.status(400).json({ message: 'Nome é obrigatório.' });
  try {
    const db = await getDb();
    const id = generateId();
    await db.run('INSERT INTO categorias (id,nome,descricao,icone) VALUES (?,?,?,?)', [id, nome, descricao || '', icone || '🔧']);
    res.status(201).json({ id, nome, descricao, icone });
  } catch (e) { res.status(500).json({ message: 'Erro ao criar categoria.' }); }
});

app.delete('/api/admin/categorias/:id', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM categorias WHERE id=?', [req.params.id]);
    res.json({ message: 'Categoria removida.' });
  } catch (e) { res.status(500).json({ message: 'Erro ao remover categoria.' }); }
});

// ── CHAMADOS ──────────────────────────────────────────────────────────────────

// Cliente vê seus próprios chamados
app.get('/api/chamados', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const isStaff = ['TECNICO','SUPERVISOR','SUPERADMIN'].includes(req.user.perfil);
    const query = `
      SELECT ch.*, c.nome AS categoria_nome, c.icone AS categoria_icone,
             cl.nome AS cliente_nome, t.nome AS tecnico_nome
      FROM chamados ch
      JOIN categorias c ON ch.categoria_id = c.id
      JOIN usuarios cl ON ch.cliente_id = cl.id
      LEFT JOIN usuarios t ON ch.tecnico_id = t.id
      ${isStaff ? '' : 'WHERE ch.cliente_id = ?'}
      ORDER BY ch.data_abertura DESC
    `;
    const rows = isStaff ? await db.all(query) : await db.all(query, [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Erro ao listar chamados.' }); }
});

// Detalhe de um chamado com mensagens
app.get('/api/chamados/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const chamado = await db.get(`
      SELECT ch.*, c.nome AS categoria_nome, c.icone AS categoria_icone,
             cl.nome AS cliente_nome, t.nome AS tecnico_nome
      FROM chamados ch
      JOIN categorias c ON ch.categoria_id = c.id
      JOIN usuarios cl ON ch.cliente_id = cl.id
      LEFT JOIN usuarios t ON ch.tecnico_id = t.id
      WHERE ch.id = ?
    `, [req.params.id]);
    if (!chamado) return res.status(404).json({ message: 'Chamado não encontrado.' });

    const isOwner = chamado.cliente_id === req.user.id;
    const isStaff = ['TECNICO','SUPERVISOR','SUPERADMIN'].includes(req.user.perfil);
    if (!isOwner && !isStaff) return res.status(403).json({ message: 'Acesso negado.' });

    const mensagens = await db.all(`
      SELECT m.*, u.nome AS autor_nome, u.perfil AS autor_perfil
      FROM mensagens m JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.chamado_id = ? ORDER BY m.data_criacao ASC
    `, [req.params.id]);

    res.json({ ...chamado, mensagens });
  } catch (e) { res.status(500).json({ message: 'Erro ao buscar chamado.' }); }
});

// Abrir chamado (CLIENTE)
app.post('/api/chamados', authenticateToken, async (req, res) => {
  const { titulo, descricao, categoria_id, prioridade } = req.body;
  if (!titulo || !descricao || !categoria_id)
    return res.status(400).json({ message: 'Título, descrição e categoria são obrigatórios.' });
  try {
    const db = await getDb();
    const id = generateId();
    await db.run(
      'INSERT INTO chamados (id,titulo,descricao,categoria_id,cliente_id,prioridade) VALUES (?,?,?,?,?,?)',
      [id, titulo, descricao, categoria_id, req.user.id, prioridade || 'MEDIA']
    );
    res.status(201).json({ message: 'Chamado aberto com sucesso!', id });
  } catch (e) { res.status(500).json({ message: 'Erro ao abrir chamado.' }); }
});

// Atualizar chamado — status, técnico (TECNICO/SUPERVISOR/SUPERADMIN)
app.put('/api/chamados/:id', authenticateToken, authorizeRoles('TECNICO','SUPERVISOR','SUPERADMIN'), async (req, res) => {
  const { status, tecnico_id, prioridade } = req.body;
  try {
    const db = await getDb();
    const chamado = await db.get('SELECT * FROM chamados WHERE id=?', [req.params.id]);
    if (!chamado) return res.status(404).json({ message: 'Chamado não encontrado.' });

    const newStatus    = status     ?? chamado.status;
    const newTecnico   = tecnico_id !== undefined ? tecnico_id : chamado.tecnico_id;
    const newPrioridade = prioridade ?? chamado.prioridade;
    const encerramento = newStatus === 'ENCERRADO' ? new Date().toISOString() : chamado.data_encerramento;

    await db.run(
      'UPDATE chamados SET status=?,tecnico_id=?,prioridade=?,data_encerramento=? WHERE id=?',
      [newStatus, newTecnico, newPrioridade, encerramento, req.params.id]
    );
    res.json({ message: 'Chamado atualizado!' });
  } catch (e) { res.status(500).json({ message: 'Erro ao atualizar chamado.' }); }
});

app.delete('/api/chamados/:id', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM chamados WHERE id=?', [req.params.id]);
    res.json({ message: 'Chamado excluído.' });
  } catch (e) { res.status(500).json({ message: 'Erro ao excluir chamado.' }); }
});

// ── MENSAGENS ─────────────────────────────────────────────────────────────────

app.post('/api/chamados/:id/mensagens', authenticateToken, async (req, res) => {
  const { conteudo } = req.body;
  if (!conteudo) return res.status(400).json({ message: 'Conteúdo é obrigatório.' });
  try {
    const db = await getDb();
    const chamado = await db.get('SELECT * FROM chamados WHERE id=?', [req.params.id]);
    if (!chamado) return res.status(404).json({ message: 'Chamado não encontrado.' });
    const isOwner = chamado.cliente_id === req.user.id;
    const isStaff = ['TECNICO','SUPERVISOR','SUPERADMIN'].includes(req.user.perfil);
    if (!isOwner && !isStaff) return res.status(403).json({ message: 'Acesso negado.' });

    const id = generateId();
    await db.run('INSERT INTO mensagens (id,chamado_id,usuario_id,conteudo) VALUES (?,?,?,?)',
      [id, req.params.id, req.user.id, conteudo]);

    // Auto update status on first tech reply
    if (isStaff && chamado.status === 'ABERTO') {
      await db.run("UPDATE chamados SET status='EM_ATENDIMENTO', tecnico_id=? WHERE id=?", [req.user.id, req.params.id]);
    }

    const msg = await db.get(`
      SELECT m.*, u.nome AS autor_nome, u.perfil AS autor_perfil
      FROM mensagens m JOIN usuarios u ON m.usuario_id = u.id WHERE m.id=?
    `, [id]);
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ message: 'Erro ao enviar mensagem.' }); }
});

app.delete('/api/mensagens/:id', authenticateToken, authorizeRoles('SUPERADMIN','SUPERVISOR'), async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM mensagens WHERE id=?', [req.params.id]);
    res.json({ message: 'Mensagem excluída.' });
  } catch (e) { res.status(500).json({ message: 'Erro ao excluir mensagem.' }); }
});

// ── ADMIN — USUARIOS ──────────────────────────────────────────────────────────

app.get('/api/admin/usuarios', authenticateToken, authorizeRoles('SUPERADMIN'), async (_req, res) => {
  try {
    const db = await getDb();
    res.json(await db.all('SELECT id,nome,email,telefone,perfil,data_criacao FROM usuarios ORDER BY nome ASC'));
  } catch (e) { res.status(500).json({ message: 'Erro ao listar usuários.' }); }
});

app.post('/api/admin/usuarios', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  const { nome, email, senha, telefone, perfil } = req.body;
  if (!nome || !email || !senha || !perfil)
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  try {
    const db = await getDb();
    if (await db.get('SELECT id FROM usuarios WHERE email=?', [email]))
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    const id = generateId();
    const senha_hash = await bcrypt.hash(senha, 10);
    await db.run('INSERT INTO usuarios (id,nome,email,senha_hash,telefone,perfil) VALUES (?,?,?,?,?,?)',
      [id, nome, email, senha_hash, telefone || null, perfil]);
    res.status(201).json({ id, nome, email, perfil });
  } catch (e) { res.status(500).json({ message: 'Erro ao criar usuário.' }); }
});

app.put('/api/admin/usuarios/:id', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  const { nome, email, telefone, perfil, senha } = req.body;
  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM usuarios WHERE id=?', [req.params.id]);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    let senha_hash = user.senha_hash;
    if (senha) senha_hash = await bcrypt.hash(senha, 10);
    await db.run('UPDATE usuarios SET nome=?,email=?,telefone=?,perfil=?,senha_hash=? WHERE id=?',
      [nome ?? user.nome, email ?? user.email, telefone ?? user.telefone, perfil ?? user.perfil, senha_hash, req.params.id]);
    res.json({ message: 'Usuário atualizado!' });
  } catch (e) { res.status(500).json({ message: 'Erro ao atualizar usuário.' }); }
});

app.delete('/api/admin/usuarios/:id', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ message: 'Você não pode excluir sua própria conta.' });
  try {
    const db = await getDb();
    await db.run('DELETE FROM usuarios WHERE id=?', [req.params.id]);
    res.json({ message: 'Usuário excluído.' });
  } catch (e) { res.status(500).json({ message: 'Erro ao excluir usuário.' }); }
});

// ── UFS & CIDADES ─────────────────────────────────────────────────────────────

app.get('/api/ufs', async (_req, res) => {
  try { res.json(await (await getDb()).all('SELECT * FROM ufs ORDER BY sigla ASC')); }
  catch (e) { res.status(500).json({ message: 'Erro ao listar UFs.' }); }
});

app.post('/api/admin/ufs', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  const { sigla, nome } = req.body;
  if (!sigla || !nome) return res.status(400).json({ message: 'Sigla e nome são obrigatórios.' });
  try {
    const db = await getDb();
    const id = generateId();
    await db.run('INSERT INTO ufs (id,sigla,nome) VALUES (?,?,?)', [id, sigla.toUpperCase(), nome]);
    res.status(201).json({ id, sigla: sigla.toUpperCase(), nome });
  } catch (e) { res.status(500).json({ message: 'Erro ao criar UF.' }); }
});

app.delete('/api/admin/ufs/:id', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  try {
    await (await getDb()).run('DELETE FROM ufs WHERE id=?', [req.params.id]);
    res.json({ message: 'UF excluída.' });
  } catch (e) { res.status(500).json({ message: 'Erro ao excluir UF.' }); }
});

app.get('/api/cidades', async (req, res) => {
  try {
    const db = await getDb();
    const { ufId } = req.query;
    const rows = ufId
      ? await db.all('SELECT * FROM cidades WHERE uf_id=? ORDER BY nome ASC', [ufId])
      : await db.all('SELECT * FROM cidades ORDER BY nome ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Erro ao listar cidades.' }); }
});

// ── TECNICOS ──────────────────────────────────────────────────────────────────

let disponibilidades = {}; // maps userId -> boolean

app.get('/api/tecnicos', async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.all("SELECT id, nome, email, telefone, perfil, data_criacao FROM usuarios WHERE perfil='TECNICO'");
    const result = users.map(u => ({
      id: u.id,
      usuarioId: u.id,
      usuario: {
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone,
        perfil: u.perfil,
        dataCriacao: u.data_criacao
      },
      documento: '123.456.789-00',
      documentoValidado: true,
      experienciaAnos: 5,
      taxaComissao: 15.0,
      descricao: 'Técnico de informática especializado.',
      ratingMedio: 4.8,
      totalAvaliacoes: 12,
      chamadosConcluidos: 8,
      disponivel: disponibilidades[u.id] !== false,
      especialidades: ['Redes', 'Hardware', 'Software'],
      dataCriacao: u.data_criacao
    }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: 'Erro ao listar técnicos.' });
  }
});

app.get('/api/tecnicos/profile', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const u = await db.get("SELECT id, nome, email, telefone, perfil, data_criacao FROM usuarios WHERE id=? AND perfil='TECNICO'", [req.user.id]);
    if (!u) return res.status(404).json({ message: 'Técnico não encontrado.' });
    const tech = {
      id: u.id,
      usuarioId: u.id,
      usuario: {
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone,
        perfil: u.perfil,
        dataCriacao: u.data_criacao
      },
      documento: '123.456.789-00',
      documentoValidado: true,
      experienciaAnos: 5,
      taxaComissao: 15.0,
      descricao: 'Técnico de informática especializado.',
      ratingMedio: 4.8,
      totalAvaliacoes: 12,
      chamadosConcluidos: 8,
      disponivel: disponibilidades[u.id] !== false,
      especialidades: ['Redes', 'Hardware', 'Software'],
      dataCriacao: u.data_criacao
    };
    res.json(tech);
  } catch (e) {
    res.status(500).json({ message: 'Erro ao buscar perfil de técnico.' });
  }
});

app.post('/api/tecnicos/toggle-disponibilidade', authenticateToken, async (req, res) => {
  const current = disponibilidades[req.user.id] !== false;
  disponibilidades[req.user.id] = !current;
  res.json({ success: true, disponivel: !current });
});

// ── PAGAMENTOS ────────────────────────────────────────────────────────────────

app.get('/api/pagamentos/metodos', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM metodos_pagamento WHERE usuario_id = ? ORDER BY padrao DESC, id ASC', [req.user.id]);
    const parsed = rows.map(r => ({
      id: r.id,
      usuario_id: r.usuario_id,
      tipo: r.tipo,
      detalhes: JSON.parse(r.detalhes),
      padrao: r.padrao === 1
    }));
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ message: 'Erro ao listar métodos de pagamento.' });
  }
});

app.post('/api/pagamentos/metodos', authenticateToken, async (req, res) => {
  const { tipo, detalhes } = req.body;
  if (!tipo || !detalhes) {
    return res.status(400).json({ message: 'Tipo e detalhes são obrigatórios.' });
  }
  try {
    const db = await getDb();
    const id = generateId();
    
    // Check count to make first method standard
    const countRow = await db.get('SELECT COUNT(*) as count FROM metodos_pagamento WHERE usuario_id = ?', [req.user.id]);
    const isFirst = countRow.count === 0;
    const padrao = isFirst ? 1 : 0;

    await db.run(
      'INSERT INTO metodos_pagamento (id, usuario_id, tipo, detalhes, padrao) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, tipo, JSON.stringify(detalhes), padrao]
    );

    res.status(201).json({ id, tipo, detalhes, padrao: padrao === 1 });
  } catch (e) {
    res.status(500).json({ message: 'Erro ao salvar método de pagamento.' });
  }
});

app.delete('/api/pagamentos/metodos/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const method = await db.get('SELECT * FROM metodos_pagamento WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id]);
    if (!method) {
      return res.status(404).json({ message: 'Método de pagamento não encontrado.' });
    }

    await db.run('DELETE FROM metodos_pagamento WHERE id = ?', [req.params.id]);

    // If deleted method was default, set another one as default
    if (method.padrao === 1) {
      const nextMethod = await db.get('SELECT id FROM metodos_pagamento WHERE usuario_id = ? LIMIT 1', [req.user.id]);
      if (nextMethod) {
        await db.run('UPDATE metodos_pagamento SET padrao = 1 WHERE id = ?', [nextMethod.id]);
      }
    }

    res.json({ message: 'Método de pagamento removido com sucesso.' });
  } catch (e) {
    res.status(500).json({ message: 'Erro ao excluir método de pagamento.' });
  }
});

app.put('/api/pagamentos/metodos/:id/padrao', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const method = await db.get('SELECT * FROM metodos_pagamento WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id]);
    if (!method) {
      return res.status(404).json({ message: 'Método de pagamento não encontrado.' });
    }

    await db.run('UPDATE metodos_pagamento SET padrao = 0 WHERE usuario_id = ?', [req.user.id]);
    await db.run('UPDATE metodos_pagamento SET padrao = 1 WHERE id = ?', [req.params.id]);

    res.json({ message: 'Método de pagamento padrão atualizado.' });
  } catch (e) {
    res.status(500).json({ message: 'Erro ao definir método padrão.' });
  }
});

// ── BOOTSTRAP ─────────────────────────────────────────────────────────────────

initDb().then(() => {
  app.listen(PORT, () => console.log(`[TechHelp Backend running on http://localhost:${PORT}]`));
}).catch(err => { console.error('Failed to initialize DB:', err); });
