import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'TECHHELP_SUPER_SECRET_JWT_KEY_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }

    if (!allowedRoles.includes(req.user.perfil)) {
      return res.status(403).json({ message: `Acesso negado. Requer perfil: ${allowedRoles.join(' ou ')}` });
    }

    next();
  };
}

export { JWT_SECRET };
