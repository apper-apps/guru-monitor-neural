import React from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Text from '@/components/atoms/Text';

const ComparisonCard = ({ loan, onRemove, formatCurrency }) => {
  return (
    <div key={loan.id} className="border border-surface-300 dark:border-surface-600 rounded-xl p-4 relative">
      <Button
        onClick={() => onRemove(loan.id)}
        className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-full flex items-center justify-center transition-colors p-0"
      >
        <Icon name="X" size={12} className="text-red-600 dark:text-red-400" />
      </Button>
      
      <div className="mb-2">
        <Text as="span" className="text-xs bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full text-surface-600 dark:text-surface-400 uppercase font-medium">
          {loan.type}
        </Text>
      </div>
      
      <div className="space-y-2">
        <div>
          <Text className="text-xs text-surface-500">Monthly EMI</Text>
          <Text as="div" className="text-lg font-bold number-display text-surface-900 dark:text-white">
            {formatCurrency(loan.emi)}
          </Text>
        </div>
        <div>
          <Text className="text-xs text-surface-500">Total Interest</Text>
          <Text as="div" className="text-sm font-medium number-display text-surface-700 dark:text-surface-300">
            {formatCurrency(loan.totalInterest)}
          </Text>
        </div>
        <Text className="text-xs text-surface-500">
          {formatCurrency(loan.principal)} • {loan.interestRate}% • {Math.round(loan.tenure/12)}y
        </Text>
      </div>
    </div>
  );
};

export default ComparisonCard;