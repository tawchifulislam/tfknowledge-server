import { getAuth } from '../lib/auth.js';

export const requireAdmin = async (req, res, next) => {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  req.user = session.user;
  next();
};
