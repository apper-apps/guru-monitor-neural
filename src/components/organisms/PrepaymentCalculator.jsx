import React from 'react';
import Card from '@/components/atoms/Card';
import Text from '@/components/atoms/Text';
import LoanInput from '@/components/molecules/LoanInput';
import PrepaymentDetails from '@/components/molecules/PrepaymentDetails';

const PrepaymentCalculator = ({ prepayment, setPrepayment, loanDataTenure, calculatePrepaymentSavings, formatCurrency }) => {
  return (
    <Card>
      <Text as="h3" className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Prepayment Calculator</Text>
      
      <LoanInput
        label="Prepayment Amount"
        value={prepayment.amount}
        onChange={(e) => setPrepayment({...prepayment, amount: parseInt(e.target.value) || 0})}
        prefix="₹"
        type="number"
      />

      <LoanInput
        label="Prepayment Month"
        value={prepayment.month}
        onChange={(e) => setPrepayment({...prepayment, month: parseInt(e.target.value) || 1})}
        min="1"
        max={loanDataTenure}
        type="number"
      />

      {prepayment.amount > 0 && (
        <PrepaymentDetails
          savings={calculatePrepaymentSavings.savings}
          newTenure={calculatePrepaymentSavings.newTenure}
          formatCurrency={formatCurrency}
        />
      )}
    </Card>
  );
};

export default PrepaymentCalculator;