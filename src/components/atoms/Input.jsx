import React from 'react';

const Input = ({ 
  type = 'text', 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  className = '', 
  prefix = '', 
  ...props 
}) => {
  const inputClass = `w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent ${prefix ? 'pl-8' : ''} ${className}`;

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className={inputClass}
        {...props}
      />
    </div>
  );
};

export default Input;