export const MOBILE_REGEX = /^\d{10}$/;

export const normalizeMobileInput = (value) =>
  String(value ?? '').replace(/\D/g, '').slice(0, 10);

export const isValidMobile = (mobile) =>
  MOBILE_REGEX.test(String(mobile ?? '').trim());

export const inputWrapperClass = (hasError) =>
  [
    'flex items-center gap-2.5 rounded-xl border px-3.5 py-2 transition-all',
    hasError
      ? 'border-red-500 bg-red-50/60 ring-4 ring-red-500/15 dark:bg-red-950/20'
      : 'border-border bg-primary focus-within:border-indigo-500 focus-within:bg-secondary focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-indigo-500/30',
  ].join(' ');

export const fieldLabelClass = (hasError) =>
  [
    'mb-0.5 block text-xs font-semibold',
    hasError ? 'text-red-600' : 'text-primary-foreground',
  ].join(' ');

export const otpInputClass = (hasError) =>
  [
    'h-9 sm:h-10 w-full min-w-0 rounded-xl border text-center text-base sm:text-lg font-bold text-primary-foreground outline-none transition-all',
    hasError
      ? 'border-red-500 bg-red-50/60 ring-4 ring-red-500/15 dark:bg-red-950/20'
      : 'border-border bg-secondary focus:border-indigo-500 focus:bg-primary focus:ring-4 focus:ring-indigo-500/10',
  ].join(' ');
