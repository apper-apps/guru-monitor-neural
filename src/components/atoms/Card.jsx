import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;