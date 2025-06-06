import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, parseISO } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import { paymentService } from '../../services'

const PaymentTrackerPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedLoan, setSelectedLoan] = useState('loan1')
  const [viewMode, setViewMode] = useState('overview') // overview, history, analytics

  useEffect(() => {
    loadDashboardData()
  }, [selectedLoan])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await paymentService.getDashboardData(selectedLoan)
      setDashboardData(data)
    } catch (err) {
      setError('Failed to load payment data')
      toast.error('Failed to load payment tracker data')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      await paymentService.exportPaymentHistory(selectedLoan, 'csv')
      toast.success('CSV exported successfully')
    } catch (err) {
      toast.error('Failed to export CSV')
    }
  }

  const handleExportPDF = async () => {
    try {
      await paymentService.exportPaymentHistory(selectedLoan, 'pdf')
      toast.success('PDF exported successfully')
    } catch (err) {
      toast.error('Failed to export PDF')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-surface-600 dark:text-surface-400">Loading payment tracker...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData || dashboardData.payments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="FileText" size={48} className="text-surface-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Payment Data</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            No payment history found. Start making payments to track your progress.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ApperIcon name="Calculator" size={16} className="mr-2" />
            Calculate EMI
          </a>
        </div>
      </div>
    )
  }

  const { overview, payments, chartData, loans } = dashboardData
  const progressPercentage = (overview.totalPaid / overview.totalLoanAmount) * 100

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Payment Tracker</h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Monitor your loan repayment progress and payment history
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={selectedLoan}
            onChange={(e) => setSelectedLoan(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {loans.map(loan => (
              <option key={loan.id} value={loan.id}>{loan.name}</option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="export-button"
            >
              <ApperIcon name="Download" size={16} className="mr-2" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="export-button"
            >
              <ApperIcon name="FileText" size={16} className="mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: 'BarChart3' },
          { id: 'history', label: 'Payment History', icon: 'History' },
          { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === tab.id
                ? 'bg-white dark:bg-surface-700 text-primary shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <ApperIcon name={tab.icon} size={16} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Key Metrics */}
          <div className="dashboard-grid mb-8">
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Total Loan Amount</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white number-display">
                    ₹{overview.totalLoanAmount.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <ApperIcon name="CreditCard" size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 number-display">
                    ₹{overview.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <ApperIcon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Remaining Balance</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 number-display">
                    ₹{overview.remainingBalance.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <ApperIcon name="AlertTriangle" size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Circular Progress */}
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Repayment Progress</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="20"
                      fill="transparent"
                      className="text-surface-200 dark:text-surface-700"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="20"
                      fill="transparent"
                      strokeDasharray={`${progressPercentage * 5.03} 502.4`}
                      className="text-primary progress-ring"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-surface-900 dark:text-white">
                        {progressPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-surface-600 dark:text-surface-400">Complete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status Overview */}
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Payment Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-surface-600 dark:text-surface-400">Next Payment Due</span>
                  <span className="font-semibold text-surface-900 dark:text-white">
                    {format(parseISO(overview.nextPaymentDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-600 dark:text-surface-400">Monthly EMI</span>
                  <span className="font-semibold text-surface-900 dark:text-white number-display">
                    ₹{overview.monthlyEMI.toLocaleString()}
                  </span>
                </div>
                {overview.overdueAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 dark:text-red-400">Overdue Amount</span>
                    <span className="font-semibold text-red-600 dark:text-red-400 number-display">
                      ₹{overview.overdueAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-surface-600 dark:text-surface-400">Payments Made</span>
                  <span className="font-semibold text-surface-900 dark:text-white">
                    {overview.paymentsMade} / {overview.totalPayments}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
              Payment Comparison: Actual vs Planned
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.paymentComparison}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="planned" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Planned Payments"
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Actual Payments"
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {viewMode === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="dashboard-card p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                <thead className="bg-surface-50 dark:bg-surface-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Interest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                  {payments.map((payment, index) => (
                    <tr key={index} className="hover:bg-surface-50 dark:hover:bg-surface-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-white">
                        {format(parseISO(payment.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900 dark:text-white number-display">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-white number-display">
                        ₹{payment.principal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-white number-display">
                        ₹{payment.interest.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full payment-status-${payment.status}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-white number-display">
                        ₹{payment.remainingBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {viewMode === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Payment Breakdown */}
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Monthly Payment Breakdown
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'currentColor' }} />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="principal" stackId="a" fill="#3B82F6" name="Principal" />
                    <Bar dataKey="interest" stackId="a" fill="#F59E0B" name="Interest" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Status Distribution */}
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Payment Status Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} payments`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default PaymentTrackerPage