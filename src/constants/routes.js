export const CLIENT_PREFIX = '/client';

export const clientRoute = (path = '') => {
  if (!path) return CLIENT_PREFIX;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${CLIENT_PREFIX}${normalized}`;
};

// Auth pages live at the site root, not under the /client prefix.
export const LOGIN_PATH = '/login';
export const REGISTER_PATH = '/register';
