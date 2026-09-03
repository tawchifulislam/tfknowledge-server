import { getAuth } from '../lib/auth.js';

export const optionalAuth = async (req, res, next) => {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });

  if (session) {
    req.user = session.user;
  }

  next();
};
