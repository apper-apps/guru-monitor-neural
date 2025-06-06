import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/atoms/Icon';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';
import Card from '@/components/atoms/Card';

const AmortizationTable = ({ showAmortization, onClose, loanData, calculateEMI, formatCurrency }) => {
  if (!showAmortization) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Text as="h3" className="text-lg font-semibold text-surface-900 dark:text-white">Payment Schedule</Text>
          <Button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <Icon name="X" size={16} className="text-surface-500" />
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-300 dark:border-surface-600">
                <th className="text-left py-2 text-surface-700 dark:text-surface-300">Month</th>
                <th className="text-right py-2 text-surface-700 dark:text-surface-300">EMI</th>
                <th className="text-right py-2 text-surface-700 dark:text-surface-300">Principal</th>
                <th className="text-right py-2 text-surface-700 dark:text-surface-300">Interest</th>
                <th className="text-right py-2 text-surface-700 dark:text-surface-300">Balance</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length: Math.min(12, loanData.tenure)}, (_, i) => {
                const monthlyRate = loanData.interestRate / (12 * 100);
                let balance = loanData.principal;
                
                for (let j = 0; j < i; j++) {
                  const interest = balance * monthlyRate;
                  const principal = calculateEMI.emi - interest;
                  balance -= principal;
                }
                
                const interest = balance * monthlyRate;
                const principal = calculateEMI.emi - interest;
                const newBalance = balance - principal;
                
                return (
                  <tr key={i + 1} className="border-b border-surface-200 dark:border-surface-700">
                    <td className="py-2 text-surface-900 dark:text-white">{i + 1}</td>
                    <td className="py-2 text-right number-display text-surface-900 dark:text-white">
                      {formatCurrency(calculateEMI.emi)}
                    </td>
                    <td className="py-2 text-right number-display text-surface-700 dark:text-surface-300">
                      {formatCurrency(Math.round(principal))}
                    </td>
                    <td className="py-2 text-right number-display text-surface-700 dark:text-surface-300">
                      {formatCurrency(Math.round(interest))}
                    </td>
                    <td className="py-2 text-right number-display text-surface-700 dark:text-surface-300">
                      {formatCurrency(Math.round(Math.max(0, newBalance)))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {loanData.tenure > 12 && (
          <Text className="mt-4 text-center text-sm text-surface-500">
            Showing first 12 months of {loanData.tenure} total payments
          </Text>
        )}
      </Card>
    </motion.div>
  );
};

export default AmortizationTable;