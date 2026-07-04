import { LOGIN_PATH, REGISTER_PATH } from '../constants/routes';

export const AUTH_UNAUTHORIZED_EVENT = 'finfiler:auth-unauthorized';

const AUTH_STORAGE_KEYS = ['token', 'username', 'mobile', 'user_type', 'user'];

export const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const isAuthPublicPath = () => {
  const path = window.location.pathname;
  return path === LOGIN_PATH || path === REGISTER_PATH;
};

/** Clear session and redirect to login when an API returns 401. */
export const handleUnauthorized = () => {
  clearAuthStorage();
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));

  if (!isAuthPublicPath()) {
    window.location.assign(LOGIN_PATH);
  }
};
