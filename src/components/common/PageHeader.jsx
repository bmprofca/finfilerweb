import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PageBackLink({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-foreground transition hover:text-indigo-600 ${className}`}
    >
      <ArrowLeft size={14} />
      {children}
    </Link>
  );
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className = '',
}) {
  return (
    <div className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {eyebrow}
          </p>
        )}
        <h1
          className={`font-semibold tracking-tight text-primary-foreground text-xl sm:text-2xl ${
            eyebrow ? 'mt-0.5' : ''
          }`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-secondary-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
