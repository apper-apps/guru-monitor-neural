import React from 'react';

const Text = ({ children, className = '', as: Component = 'p', ...props }) => {
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

export default Text;