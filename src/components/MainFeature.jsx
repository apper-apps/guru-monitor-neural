import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import loanService from '../services/api/loanService'
import paymentService from '../services/api/paymentService'

const MainFeature = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [loanData, setLoanData] = useState({
    principal: 2500000,
    interestRate: 8.5,
    tenure: 240
  })
  const [showAmortization, setShowAmortization] = useState(false)
  const [comparisons, setComparisons] = useState([])
  const [prepayment, setPrepayment] = useState({ amount: 0, month: 12 })
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(false)

  const loanTypes = [
    { id: 'home', name: 'Home Loan', icon: 'Home', color: 'bg-blue-500' },
    { id: 'car', name: 'Car Loan', icon: 'Car', color: 'bg-green-500' },
    { id: 'personal', name: 'Personal Loan', icon: 'User', color: 'bg-purple-500' }
  ]

  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = async () => {
    setLoading(true)
    try {
      const data = await loanService.getAll()
      setPresets(data)
    } catch (error) {
      toast.error('Failed to load loan presets')
    } finally {
      setLoading(false)
    }
  }

  const calculateEMI = useMemo(() => {
    const { principal, interestRate, tenure } = loanData
    const monthlyRate = interestRate / (12 * 100)
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1)
    const totalAmount = emi * tenure
    const totalInterest = totalAmount - principal
    
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount)
    }
  }, [loanData])

  const generateAmortization = async () => {
    setLoading(true)
    try {
      const schedule = await paymentService.generateSchedule(loanData)
      setShowAmortization(true)
      toast.success('Amortization schedule generated')
      return schedule
    } catch (error) {
      toast.error('Failed to generate schedule')
      return []
    } finally {
      setLoading(false)
    }
  }

  const addToComparison = async () => {
    if (comparisons.length >= 3) {
      toast.warning('Maximum 3 loans can be compared')
      return
    }

    try {
      const loanToCompare = {
        ...loanData,
        type: activeTab,
        ...calculateEMI,
        id: Date.now()
      }
      const newComparison = await loanService.create(loanToCompare)
      setComparisons([...comparisons, newComparison])
      toast.success('Loan added to comparison')
    } catch (error) {
      toast.error('Failed to add loan to comparison')
    }
  }

  const removeFromComparison = async (id) => {
    try {
      await loanService.delete(id)
      setComparisons(comparisons.filter(loan => loan.id !== id))
      toast.success('Loan removed from comparison')
    } catch (error) {
      toast.error('Failed to remove loan')
    }
  }

  const calculatePrepaymentSavings = useMemo(() => {
    if (!prepayment.amount || prepayment.amount <= 0) return { savings: 0, newTenure: loanData.tenure }
    
    const { principal, interestRate, tenure } = loanData
    const monthlyRate = interestRate / (12 * 100)
    const currentEMI = calculateEMI.emi
    
    // Calculate remaining principal after prepayment month
    let remainingPrincipal = principal
    for (let i = 1; i <= prepayment.month; i++) {
      const interest = remainingPrincipal * monthlyRate
      const principalPayment = currentEMI - interest
      remainingPrincipal -= principalPayment
    }
    
    // Reduce principal by prepayment
    remainingPrincipal -= prepayment.amount
    
    if (remainingPrincipal <= 0) return { savings: 0, newTenure: prepayment.month }
    
    // Calculate new tenure
    const newTenure = Math.ceil(
      Math.log(1 + (remainingPrincipal * monthlyRate) / currentEMI) / 
      Math.log(1 + monthlyRate)
    )
    
    const originalTotalPayment = currentEMI * tenure
    const newTotalPayment = (currentEMI * prepayment.month) + prepayment.amount + (currentEMI * newTenure)
    const savings = originalTotalPayment - newTotalPayment
    
    return {
      savings: Math.max(0, Math.round(savings)),
      newTenure: prepayment.month + newTenure
    }
  }, [loanData, prepayment, calculateEMI.emi])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCurrentTypePresets = () => {
    return presets.filter(preset => preset.type === activeTab) || []
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loan Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {loanTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === type.id
                ? 'bg-primary text-white shadow-card transform scale-105'
                : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
            }`}
          >
            <ApperIcon name={type.icon} size={16} />
            <span>{type.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 mb-6">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Loan Details</h2>
            
            {/* Principal Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Loan Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">₹</span>
                <input
                  type="number"
                  value={loanData.principal}
                  onChange={(e) => setLoanData({...loanData, principal: parseInt(e.target.value) || 0})}
                  className="w-full pl-8 pr-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <input
                type="range"
                min="100000"
                max="10000000"
                step="50000"
                value={loanData.principal}
                onChange={(e) => setLoanData({...loanData, principal: parseInt(e.target.value)})}
                className="w-full mt-2 h-2 bg-surface-200 dark:bg-surface-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Interest Rate */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Interest Rate (% per annum)
              </label>
              <input
                type="number"
                step="0.1"
                value={loanData.interestRate}
                onChange={(e) => setLoanData({...loanData, interestRate: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="range"
                min="6"
                max="20"
                step="0.1"
                value={loanData.interestRate}
                onChange={(e) => setLoanData({...loanData, interestRate: parseFloat(e.target.value)})}
                className="w-full mt-2 h-2 bg-surface-200 dark:bg-surface-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tenure */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Tenure (months)
              </label>
              <input
                type="number"
                value={loanData.tenure}
                onChange={(e) => setLoanData({...loanData, tenure: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="range"
                min="12"
                max="360"
                step="12"
                value={loanData.tenure}
                onChange={(e) => setLoanData({...loanData, tenure: parseInt(e.target.value)})}
                className="w-full mt-2 h-2 bg-surface-200 dark:bg-surface-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-sm text-surface-500 mt-1">
                {Math.round(loanData.tenure / 12)} years
              </div>
            </div>

            {/* Quick Presets */}
            {getCurrentTypePresets().length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getCurrentTypePresets().slice(0, 4).map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => setLoanData({
                        principal: preset.principal,
                        interestRate: preset.interestRate,
                        tenure: preset.tenure
                      })}
                      className="p-2 text-xs bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg text-left transition-colors"
                    >
                      <div className="font-medium">{formatCurrency(preset.principal)}</div>
                      <div className="text-surface-500">{preset.interestRate}% • {preset.tenure/12}y</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prepayment Calculator */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Prepayment Calculator</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Prepayment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">₹</span>
                <input
                  type="number"
                  value={prepayment.amount}
                  onChange={(e) => setPrepayment({...prepayment, amount: parseInt(e.target.value) || 0})}
                  className="w-full pl-8 pr-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Prepayment Month
              </label>
              <input
                type="number"
                min="1"
                max={loanData.tenure}
                value={prepayment.month}
                onChange={(e) => setPrepayment({...prepayment, month: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {prepayment.amount > 0 && (
              <div className="bg-secondary-light bg-opacity-10 dark:bg-secondary-dark dark:bg-opacity-20 rounded-xl p-4">
                <div className="text-sm text-surface-600 dark:text-surface-400 mb-1">Interest Savings</div>
                <div className="text-lg font-bold text-secondary number-display">
                  {formatCurrency(calculatePrepaymentSavings.savings)}
                </div>
                <div className="text-sm text-surface-500 mt-1">
                  New tenure: {Math.round(calculatePrepaymentSavings.newTenure / 12)} years
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {/* EMI Result Card */}
          <motion.div 
            className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-card p-8 mb-6 text-white"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2 opacity-90">Monthly EMI</h2>
              <motion.div 
                className="text-4xl md:text-5xl font-bold number-display mb-6"
                key={calculateEMI.emi}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatCurrency(calculateEMI.emi)}
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm opacity-75 mb-1">Principal Amount</div>
                  <div className="text-xl font-semibold number-display">{formatCurrency(loanData.principal)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-75 mb-1">Total Interest</div>
                  <div className="text-xl font-semibold number-display">{formatCurrency(calculateEMI.totalInterest)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-75 mb-1">Total Amount</div>
                  <div className="text-xl font-semibold number-display">{formatCurrency(calculateEMI.totalAmount)}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={generateAmortization}
              disabled={loading}
              className="flex items-center space-x-2 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 px-6 py-3 rounded-xl border border-surface-300 dark:border-surface-600 font-medium transition-colors disabled:opacity-50"
            >
              <ApperIcon name="FileText" size={16} />
              <span>View Schedule</span>
            </button>
            
            <button
              onClick={addToComparison}
              className="flex items-center space-x-2 bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <ApperIcon name="Plus" size={16} />
              <span>Add to Compare</span>
            </button>
          </div>

          {/* Comparison Panel */}
          {comparisons.length > 0 && (
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Loan Comparison</h3>
                <span className="text-sm text-surface-500">{comparisons.length}/3 loans</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {comparisons.map(loan => (
                  <div key={loan.id} className="border border-surface-300 dark:border-surface-600 rounded-xl p-4 relative">
                    <button
                      onClick={() => removeFromComparison(loan.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ApperIcon name="X" size={12} className="text-red-600 dark:text-red-400" />
                    </button>
                    
                    <div className="mb-2">
                      <span className="text-xs bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full text-surface-600 dark:text-surface-400 uppercase font-medium">
                        {loan.type}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-surface-500">Monthly EMI</div>
                        <div className="text-lg font-bold number-display text-surface-900 dark:text-white">
                          {formatCurrency(loan.emi)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-surface-500">Total Interest</div>
                        <div className="text-sm font-medium number-display text-surface-700 dark:text-surface-300">
                          {formatCurrency(loan.totalInterest)}
                        </div>
                      </div>
                      <div className="text-xs text-surface-500">
                        {formatCurrency(loan.principal)} • {loan.interestRate}% • {Math.round(loan.tenure/12)}y
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {comparisons.length > 1 && (
                <div className="mt-4 p-3 bg-secondary-light bg-opacity-10 dark:bg-secondary-dark dark:bg-opacity-20 rounded-xl">
                  <div className="text-sm font-medium text-secondary">
                    Best Option: {comparisons.reduce((best, current) => 
                      current.emi < best.emi ? current : best
                    ).type.toUpperCase()} LOAN
                  </div>
                  <div className="text-xs text-surface-600 dark:text-surface-400">
                    Lowest EMI of {formatCurrency(Math.min(...comparisons.map(loan => loan.emi)))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amortization Table */}
          {showAmortization && (
            <motion.div 
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Payment Schedule</h3>
                <button
                  onClick={() => setShowAmortization(false)}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" size={16} className="text-surface-500" />
                </button>
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
                      const monthlyRate = loanData.interestRate / (12 * 100)
                      let balance = loanData.principal
                      
                      for (let j = 0; j < i; j++) {
                        const interest = balance * monthlyRate
                        const principal = calculateEMI.emi - interest
                        balance -= principal
                      }
                      
                      const interest = balance * monthlyRate
                      const principal = calculateEMI.emi - interest
                      const newBalance = balance - principal
                      
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
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {loanData.tenure > 12 && (
                <div className="mt-4 text-center text-sm text-surface-500">
                  Showing first 12 months of {loanData.tenure} total payments
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MainFeature