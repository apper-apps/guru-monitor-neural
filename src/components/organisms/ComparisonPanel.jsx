import React from 'react';
import ComparisonCard from '@/components/molecules/ComparisonCard';
import Text from '@/components/atoms/Text';
import Card from '@/components/atoms/Card';

const ComparisonPanel = ({ comparisons, removeFromComparison, formatCurrency }) => {
  if (comparisons.length === 0) return null;

  const bestOption = comparisons.length > 1 
    ? comparisons.reduce((best, current) => current.emi < best.emi ? current : best)
    : null;

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Text as="h3" className="text-lg font-semibold text-surface-900 dark:text-white">Loan Comparison</Text>
        <Text as="span" className="text-sm text-surface-500">{comparisons.length}/3 loans</Text>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisons.map(loan => (
          <ComparisonCard 
            key={loan.id} 
            loan={loan} 
            onRemove={removeFromComparison} 
            formatCurrency={formatCurrency} 
          />
        ))}
      </div>
      
      {bestOption && (
        <div className="mt-4 p-3 bg-secondary-light bg-opacity-10 dark:bg-secondary-dark dark:bg-opacity-20 rounded-xl">
          <Text className="text-sm font-medium text-secondary">
            Best Option: {bestOption.type.toUpperCase()} LOAN
          </Text>
          <Text className="text-xs text-surface-600 dark:text-surface-400">
            Lowest EMI of {formatCurrency(Math.min(...comparisons.map(loan => loan.emi)))}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ComparisonPanel;