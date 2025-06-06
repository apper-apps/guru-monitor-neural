import React from 'react';
import { motion } from 'framer-motion';
import Text from '@/components/atoms/Text';

const EmiSummaryCard = ({ emi, principal, totalInterest, totalAmount, formatCurrency }) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-card p-8 mb-6 text-white"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <Text as="h2" className="text-lg font-medium mb-2 opacity-90">Monthly EMI</Text>
        <motion.div 
          className="text-4xl md:text-5xl font-bold number-display mb-6"
          key={emi}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatCurrency(emi)}
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Text className="text-sm opacity-75 mb-1">Principal Amount</Text>
            <Text as="div" className="text-xl font-semibold number-display">{formatCurrency(principal)}</Text>
          </div>
          <div className="text-center">
            <Text className="text-sm opacity-75 mb-1">Total Interest</Text>
            <Text as="div" className="text-xl font-semibold number-display">{formatCurrency(totalInterest)}</Text>
          </div>
          <div className="text-center">
            <Text className="text-sm opacity-75 mb-1">Total Amount</Text>
            <Text as="div" className="text-xl font-semibold number-display">{formatCurrency(totalAmount)}</Text>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmiSummaryCard;