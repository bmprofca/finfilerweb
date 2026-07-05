export const PANEL_PREFIX = '/panel';

export const clientRoute = (path = '') => {
  if (!path) return PANEL_PREFIX;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${PANEL_PREFIX}${normalized}`;
};

// Auth pages live at the site root, not under the /panel prefix.
export const LOGIN_PATH = '/login';
export const REGISTER_PATH = '/register';
