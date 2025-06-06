import paymentData from '../mockData/payment.json'

class PaymentService {
  constructor() {
    this.payments = [...paymentData]
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
    
    this.payments[index] = {
      ...this.payments[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    return { ...this.payments[index] }
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