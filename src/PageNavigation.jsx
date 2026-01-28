import { Link, useLocation } from 'react-router-dom'
import './PageNavigation.css'

function PageNavigation() {
  const location = useLocation()
  
  return (
    <div className="page-navigation">
      <Link 
        to="/financial-health" 
        className={`page-nav-tab ${location.pathname === '/financial-health' ? 'active' : ''}`}
      >
        Financial Health
      </Link>
      <Link 
        to="/operations-compliance" 
        className={`page-nav-tab ${location.pathname === '/operations-compliance' ? 'active' : ''}`}
      >
        Operations & Compliance
      </Link>
      <Link 
        to="/billing-insights" 
        className={`page-nav-tab ${location.pathname === '/billing-insights' ? 'active' : ''}`}
      >
        Billing Insights
      </Link>
    </div>
  )
}

export default PageNavigation
