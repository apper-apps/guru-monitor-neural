import paymentData from '../mockData/payment.json'
import { isBefore, parseISO, addMonths, format } from 'date-fns'

class PaymentService {
  constructor() {
    // Initialize with payment history from JSON, fallback to empty array if not found
    this.payments = paymentData.paymentHistory ? [...paymentData.paymentHistory] : []
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.payments]
  }

  async getById(id) {
    await this.delay()
    const payment = this.payments.find(p => p.id === id)
    if (!payment) {
      throw new Error('Payment not found')
    }
    return { ...payment }
  }

  async create(paymentData) {
    await this.delay()
    const newPayment = {
      ...paymentData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    this.payments.push(newPayment)
    return { ...newPayment }
  }

async update(id, updateData) {
    await this.delay()
    const index = this.payments.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Payment not found')
    }
    this.payments[index] = { ...this.payments[index], ...updateData }
    return { ...this.payments[index] }
  }

  async getDashboardData(loanId = 'loan1') {
    await this.delay(400)
    const loan = paymentData.loans.find(l => l.id === loanId)
    if (!loan) {
      throw new Error('Loan not found')
    }

    const payments = paymentData.paymentHistory.filter(p => p.loanId === loanId)
    
    // Calculate overview metrics
    const totalPaid = payments
      .filter(p => p.status === 'on-time' || p.status === 'late')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const remainingBalance = loan.totalAmount - totalPaid
    const progressPercentage = (totalPaid / loan.totalAmount) * 100
    
    // Calculate overdue amount
    const today = new Date()
    const overduePayments = payments.filter(p => 
      p.status === 'overdue' || (p.status === 'upcoming' && isBefore(parseISO(p.dueDate), today))
    )
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0)

    // Find next payment date
    const upcomingPayments = payments.filter(p => p.status === 'upcoming')
    const nextPaymentDate = upcomingPayments.length > 0 
      ? upcomingPayments[0].dueDate 
      : addMonths(today, 1).toISOString()

    const overview = {
      totalLoanAmount: loan.totalAmount,
      totalPaid,
      remainingBalance,
      progressPercentage,
      nextPaymentDate,
      monthlyEMI: loan.monthlyEMI,
      overdueAmount,
      paymentsMade: payments.filter(p => p.status === 'on-time' || p.status === 'late').length,
      totalPayments: loan.tenure
    }

    // Generate chart data
    const chartData = this.generateChartData(payments, loan)

    return {
      overview,
      payments: payments.sort((a, b) => new Date(b.date) - new Date(a.date)),
      chartData,
      loans: paymentData.loans
}
  }

  generateChartData(payments, loan) {
    // Payment comparison data (planned vs actual)
    const monthlyData = []
    let cumulativePlanned = 0
    let cumulativeActual = 0

    for (let i = 0; i < 12; i++) {
      const month = format(addMonths(parseISO(loan.startDate), i), 'MMM yyyy')
      cumulativePlanned += loan.monthlyEMI
      
      const monthPayments = payments.filter(p => {
        const paymentMonth = format(parseISO(p.date), 'MMM yyyy')
        return paymentMonth === month && (p.status === 'on-time' || p.status === 'late')
      })
      
      cumulativeActual += monthPayments.reduce((sum, p) => sum + p.amount, 0)
      
      monthlyData.push({
        month,
        planned: cumulativePlanned,
        actual: cumulativeActual
      })
    }

    // Monthly breakdown (principal vs interest)
    const monthlyBreakdown = payments.slice(0, 12).map(payment => ({
      month: format(parseISO(payment.date), 'MMM'),
      principal: payment.principal,
      interest: payment.interest
    }))

    // Status distribution
    const statusCounts = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1
      return acc
    }, {})

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      count,
      status
    }))

    return {
      paymentComparison: monthlyData,
      monthlyBreakdown,
      statusDistribution
    }
}

  async exportPaymentHistory(loanId, format = 'csv') {
    await this.delay(500)
    const dashboardData = await this.getDashboardData(loanId)
    const { payments, overview } = dashboardData

    if (format === 'csv') {
      const csvContent = this.generateCSV(payments, overview)
      this.downloadFile(csvContent, `payment-history-${loanId}.csv`, 'text/csv')
    } else if (format === 'pdf') {
      // Note: In a real implementation, you would use a proper PDF library
      // For now, we'll create a simple text-based PDF content
      const pdfContent = this.generatePDFContent(payments, overview)
      this.downloadFile(pdfContent, `payment-history-${loanId}.txt`, 'text/plain')
    }

return { success: true }
  }

  generateCSV(payments, overview) {
    const headers = ['Date', 'Amount', 'Principal', 'Interest', 'Status', 'Remaining Balance']
    const rows = payments.map(payment => [
      format(parseISO(payment.date), 'yyyy-MM-dd'),
      payment.amount,
      payment.principal,
      payment.interest,
      payment.status,
      payment.remainingBalance
    ])

    const csvContent = [
      `Loan Summary`,
      `Total Loan Amount,₹${overview.totalLoanAmount.toLocaleString()}`,
      `Amount Paid,₹${overview.totalPaid.toLocaleString()}`,
      `Remaining Balance,₹${overview.remainingBalance.toLocaleString()}`,
      `Progress,${overview.progressPercentage.toFixed(2)}%`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

return csvContent
  }

  generatePDFContent(payments, overview) {
    const content = [
      'PAYMENT HISTORY REPORT',
      '='.repeat(50),
      '',
      'LOAN SUMMARY:',
      `-Total Loan Amount: ₹${overview.totalLoanAmount.toLocaleString()}`,
      `-Amount Paid: ₹${overview.totalPaid.toLocaleString()}`,
      `-Remaining Balance: ₹${overview.remainingBalance.toLocaleString()}`,
      `-Progress: ${overview.progressPercentage.toFixed(2)}%`,
      `-Monthly EMI: ₹${overview.monthlyEMI.toLocaleString()}`,
      '',
      'PAYMENT HISTORY:',
      '-'.repeat(50),
      ...payments.map(payment => 
        `Date: ${format(parseISO(payment.date), 'MMM dd, yyyy')} | Amount: ₹${payment.amount.toLocaleString()} | Status: ${payment.status}`
      )
    ].join('\n')

return content
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
URL.revokeObjectURL(url)
  }

  async delete(id) {
    await this.delay()
    const index = this.payments.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Payment not found')
    }
    
    const deletedPayment = this.payments.splice(index, 1)[0]
    return { ...deletedPayment }
  }
  async generateSchedule(loanData) {
    await this.delay()
    const { principal, interestRate, tenure } = loanData
    const monthlyRate = interestRate / (12 * 100)
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1)
    
    const schedule = []
    let remainingBalance = principal
    
    for (let month = 1; month <= tenure; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = emi - interestPayment
      remainingBalance -= principalPayment
      
      schedule.push({
        id: Date.now() + month,
        month,
        emiAmount: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(Math.max(0, remainingBalance))
      })
    }
    
    return schedule
  }

  async getByLoanId(loanId) {
    await this.delay()
    return this.payments.filter(payment => payment.loanId === loanId).map(payment => ({ ...payment }))
  }
}

export default new PaymentService()