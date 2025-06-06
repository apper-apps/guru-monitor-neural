import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import loanService from '@/services/api/loanService';
import paymentService from '@/services/api/paymentService';
import EmiSummaryCard from '@/components/molecules/EmiSummaryCard';
import LoanCalculatorForm from '@/components/organisms/LoanCalculatorForm';
import PrepaymentCalculator from '@/components/organisms/PrepaymentCalculator';
import ComparisonPanel from '@/components/organisms/ComparisonPanel';
import AmortizationTable from '@/components/organisms/AmortizationTable';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import LoanTypeTabs from '@/components/organisms/LoanTypeTabs';
import Text from '@/components/atoms/Text';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [loanData, setLoanData] = useState({
    principal: 2500000,
    interestRate: 8.5,
    tenure: 240
  });
  const [showAmortization, setShowAmortization] = useState(false);
  const [comparisons, setComparisons] = useState([]);
  const [prepayment, setPrepayment] = useState({ amount: 0, month: 12 });
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);

  const loanTypes = [
    { id: 'home', name: 'Home Loan', icon: 'Home', color: 'bg-blue-500' },
    { id: 'car', name: 'Car Loan', icon: 'Car', color: 'bg-green-500' },
    { id: 'personal', name: 'Personal Loan', icon: 'User', color: 'bg-purple-500' }
  ];

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const data = await loanService.getAll();
      setPresets(data);
    } catch (error) {
      toast.error('Failed to load loan presets');
    } finally {
      setLoading(false);
    }
  };

  const calculateEMI = useMemo(() => {
    const { principal, interestRate, tenure } = loanData;
    const monthlyRate = interestRate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - principal;
    
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount)
    };
  }, [loanData]);

  const generateAmortization = async () => {
    setLoading(true);
    try {
      const schedule = await paymentService.generateSchedule(loanData);
      setShowAmortization(true);
      toast.success('Amortization schedule generated');
      return schedule;
    } catch (error) {
      toast.error('Failed to generate schedule');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addToComparison = async () => {
    if (comparisons.length >= 3) {
      toast.warning('Maximum 3 loans can be compared');
      return;
    }

    try {
      const loanToCompare = {
        ...loanData,
        type: activeTab,
        ...calculateEMI,
        id: Date.now()
      };
      const newComparison = await loanService.create(loanToCompare);
      setComparisons([...comparisons, newComparison]);
      toast.success('Loan added to comparison');
    } catch (error) {
      toast.error('Failed to add loan to comparison');
    }
  };

  const removeFromComparison = async (id) => {
    try {
      await loanService.delete(id);
      setComparisons(comparisons.filter(loan => loan.id !== id));
      toast.success('Loan removed from comparison');
    } catch (error) {
      toast.error('Failed to remove loan');
    }
  };

  const calculatePrepaymentSavings = useMemo(() => {
    if (!prepayment.amount || prepayment.amount <= 0) return { savings: 0, newTenure: loanData.tenure };
    
    const { principal, interestRate, tenure } = loanData;
    const monthlyRate = interestRate / (12 * 100);
    const currentEMI = calculateEMI.emi;
    
    let remainingPrincipal = principal;
    for (let i = 1; i <= prepayment.month; i++) {
      const interest = remainingPrincipal * monthlyRate;
      const principalPayment = currentEMI - interest;
      remainingPrincipal -= principalPayment;
    }
    
    remainingPrincipal -= prepayment.amount;
    
    if (remainingPrincipal <= 0) return { savings: 0, newTenure: prepayment.month };
    
    const newTenure = Math.ceil(
      Math.log(1 + (remainingPrincipal * monthlyRate) / currentEMI) / 
      Math.log(1 + monthlyRate)
    );
    
    const originalTotalPayment = currentEMI * tenure;
    const newTotalPayment = (currentEMI * prepayment.month) + prepayment.amount + (currentEMI * newTenure);
    const savings = originalTotalPayment - newTotalPayment;
    
    return {
      savings: Math.max(0, Math.round(savings)),
      newTenure: prepayment.month + newTenure
    };
  }, [loanData, prepayment, calculateEMI.emi]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LoanTypeTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        loanTypes={loanTypes} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <LoanCalculatorForm
            loanData={loanData}
            setLoanData={setLoanData}
            presets={presets}
            activeTab={activeTab}
            formatCurrency={formatCurrency}
          />
          <PrepaymentCalculator
            prepayment={prepayment}
            setPrepayment={setPrepayment}
            loanDataTenure={loanData.tenure}
            calculatePrepaymentSavings={calculatePrepaymentSavings}
            formatCurrency={formatCurrency}
          />
        </div>

        <div className="lg:col-span-2">
          <EmiSummaryCard
            emi={calculateEMI.emi}
            principal={loanData.principal}
            totalInterest={calculateEMI.totalInterest}
            totalAmount={calculateEMI.totalAmount}
            formatCurrency={formatCurrency}
          />

          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              onClick={generateAmortization}
              disabled={loading}
              className="flex items-center space-x-2 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 px-6 py-3 rounded-xl border border-surface-300 dark:border-surface-600 font-medium disabled:opacity-50"
            >
              <Icon name="FileText" size={16} />
              <Text as="span">View Schedule</Text>
            </Button>
            
            <Button
              onClick={addToComparison}
              className="flex items-center space-x-2 bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-xl font-medium"
            >
              <Icon name="Plus" size={16} />
              <Text as="span">Add to Compare</Text>
            </Button>
          </div>

          <ComparisonPanel
            comparisons={comparisons}
            removeFromComparison={removeFromComparison}
            formatCurrency={formatCurrency}
          />

          <AmortizationTable
            showAmortization={showAmortization}
            onClose={() => setShowAmortization(false)}
            loanData={loanData}
            calculateEMI={calculateEMI}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;