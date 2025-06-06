import React from 'react';

const Button = ({ children, onClick, className = '', disabled = false, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-xl font-medium transition-all ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;