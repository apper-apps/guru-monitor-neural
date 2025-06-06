import React from 'react';
import ApperIcon from '@/components/ApperIcon'; // Assuming ApperIcon is available at this path

const Icon = ({ name, size = 16, className = '', ...props }) => {
  return <ApperIcon name={name} size={size} className={className} {...props} />;
};

export default Icon;