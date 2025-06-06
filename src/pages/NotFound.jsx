import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ApperIcon name="Calculator" size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-4">Page Not Found</h1>
        <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md">
          The page you're looking for doesn't exist. Let's get you back to calculating EMIs.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <ApperIcon name="ArrowLeft" size={16} />
          <span>Back to Calculator</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFound