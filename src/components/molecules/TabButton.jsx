import React from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Text from '@/components/atoms/Text';

const TabButton = ({ type, isActive, onClick }) => {
  return (
    <Button
      onClick={() => onClick(type.id)}
      className={`flex items-center space-x-2 ${
        isActive
          ? 'bg-primary text-white shadow-card transform scale-105'
          : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
      }`}
    >
      <Icon name={type.icon} size={16} />
      <Text as="span">{type.name}</Text>
    </Button>
  );
};

export default TabButton;