import comparisonData from '../mockData/comparison.json'

class ComparisonService {
  constructor() {
    this.comparisons = [...comparisonData]
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.comparisons]
  }

  async getById(id) {
    await this.delay()
    const comparison = this.comparisons.find(c => c.id === id)
    if (!comparison) {
      throw new Error('Comparison not found')
    }
    return { ...comparison }
  }

  async create(comparisonData) {
    await this.delay()
    const newComparison = {
      ...comparisonData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    this.comparisons.push(newComparison)
    return { ...newComparison }
  }

  async update(id, updateData) {
    await this.delay()
    const index = this.comparisons.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Comparison not found')
    }
    
    this.comparisons[index] = {
      ...this.comparisons[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    return { ...this.comparisons[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.comparisons.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Comparison not found')
    }
    
    const deletedComparison = this.comparisons.splice(index, 1)[0]
    return { ...deletedComparison }
  }

  async compareLoans(loans) {
    await this.delay()
    
    if (!loans || loans.length < 2) {
      throw new Error('At least 2 loans required for comparison')
    }
    
    const bestLoan = loans.reduce((best, current) => {
      if (current.emi < best.emi) return current
      if (current.emi === best.emi && current.totalInterest < best.totalInterest) return current
      return best
    })
    
    const worstLoan = loans.reduce((worst, current) => {
      if (current.emi > worst.emi) return current
      if (current.emi === worst.emi && current.totalInterest > worst.totalInterest) return current
      return worst
    })
    
    const savingsAmount = worstLoan.totalAmount - bestLoan.totalAmount
    
    return {
      id: Date.now(),
      loans: loans.map(loan => ({ ...loan })),
      bestOption: bestLoan.type,
      worstOption: worstLoan.type,
      savingsAmount: Math.round(savingsAmount),
      createdAt: new Date().toISOString()
    }
  }
}

export default new ComparisonService()