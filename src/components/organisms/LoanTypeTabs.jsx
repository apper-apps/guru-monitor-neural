import React from 'react';
import TabButton from '@/components/molecules/TabButton';

const LoanTypeTabs = ({ activeTab, setActiveTab, loanTypes }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {loanTypes.map(type => (
        <TabButton
          key={type.id}
          type={type}
          isActive={activeTab === type.id}
          onClick={setActiveTab}
        />
      ))}
    </div>
  );
};

export default LoanTypeTabs;