import React from 'react';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';

const PresetButton = ({ preset, onClick, formatCurrency }) => {
  return (
    <Button
      onClick={onClick}
      className="p-2 text-xs bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg text-left transition-colors"
    >
      <Text className="font-medium">{formatCurrency(preset.principal)}</Text>
      <Text className="text-surface-500">{preset.interestRate}% • {preset.tenure/12}y</Text>
    </Button>
  );
};

export default PresetButton;