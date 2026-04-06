import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-lg
          bg-bg-card border border-border-default
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error ? 'border-accent-red' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-red">{error}</p>
      )}
    </div>
  );
}
