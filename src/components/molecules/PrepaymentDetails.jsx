import React from 'react';
import Text from '@/components/atoms/Text';

const PrepaymentDetails = ({ savings, newTenure, formatCurrency }) => {
  return (
    <div className="bg-secondary-light bg-opacity-10 dark:bg-secondary-dark dark:bg-opacity-20 rounded-xl p-4">
      <Text className="text-sm text-surface-600 dark:text-surface-400 mb-1">Interest Savings</Text>
      <Text as="div" className="text-lg font-bold text-secondary number-display">
        {formatCurrency(savings)}
      </Text>
      <Text className="text-sm text-surface-500 mt-1">
        New tenure: {Math.round(newTenure / 12)} years
      </Text>
    </div>
  );
};

export default PrepaymentDetails;