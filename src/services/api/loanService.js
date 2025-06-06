import loanData from '../mockData/loan.json'

class LoanService {
  constructor() {
    this.loans = [...loanData]
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.loans]
  }

  async getById(id) {
    await this.delay()
    const loan = this.loans.find(l => l.id === id)
    if (!loan) {
      throw new Error('Loan not found')
    }
    return { ...loan }
  }

  async create(loanData) {
    await this.delay()
    const newLoan = {
      ...loanData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    this.loans.push(newLoan)
    return { ...newLoan }
  }

  async update(id, updateData) {
    await this.delay()
    const index = this.loans.findIndex(l => l.id === id)
    if (index === -1) {
      throw new Error('Loan not found')
    }
    
    this.loans[index] = {
      ...this.loans[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    return { ...this.loans[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.loans.findIndex(l => l.id === id)
    if (index === -1) {
      throw new Error('Loan not found')
    }
    
    const deletedLoan = this.loans.splice(index, 1)[0]
    return { ...deletedLoan }
  }

  async getByType(type) {
    await this.delay()
    return this.loans.filter(loan => loan.type === type).map(loan => ({ ...loan }))
  }

  calculateEMI(principal, rate, tenure) {
    const monthlyRate = rate / (12 * 100)
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1)
    return Math.round(emi)
  }
}

export default new LoanService()