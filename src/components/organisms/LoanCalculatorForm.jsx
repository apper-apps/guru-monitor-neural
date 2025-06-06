import React from 'react';
import Card from '@/components/atoms/Card';
import Text from '@/components/atoms/Text';
import LoanInput from '@/components/molecules/LoanInput';
import PresetButton from '@/components/molecules/PresetButton';

const LoanCalculatorForm = ({ loanData, setLoanData, presets, activeTab, formatCurrency }) => {
  const getCurrentTypePresets = () => {
    return presets.filter(preset => preset.type === activeTab) || [];
  };

  return (
    <Card className="mb-6">
      <Text as="h2" className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Loan Details</Text>
      
      <LoanInput
        label="Loan Amount"
        value={loanData.principal}
        onChange={(e) => setLoanData({...loanData, principal: parseInt(e.target.value) || 0})}
        prefix="₹"
        min="100000"
        max="10000000"
        step="50000"
      />

      <LoanInput
        label="Interest Rate (% per annum)"
        value={loanData.interestRate}
        onChange={(e) => setLoanData({...loanData, interestRate: parseFloat(e.target.value) || 0})}
        step="0.1"
        min="6"
        max="20"
      />

      <LoanInput
        label="Tenure (months)"
        value={loanData.tenure}
        onChange={(e) => setLoanData({...loanData, tenure: parseInt(e.target.value) || 0})}
        min="12"
        max="360"
        step="12"
        description={`${Math.round(loanData.tenure / 12)} years`}
      />

      {getCurrentTypePresets().length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Quick Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {getCurrentTypePresets().slice(0, 4).map(preset => (
              <PresetButton
                key={preset.id}
                preset={preset}
                onClick={() => setLoanData({
                  principal: preset.principal,
                  interestRate: preset.interestRate,
                  tenure: preset.tenure
                })}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default LoanCalculatorForm;