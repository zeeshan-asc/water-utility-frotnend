import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './Home'
import FinancialHealth from './FinancialHealth'
import OperationsCompliance from './OperationsCompliance'
import BillingInsights from './BillingInsights'

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/financial-health" element={<FinancialHealth />} />
        <Route path="/operations-compliance" element={<OperationsCompliance />} />
        <Route path="/billing-insights" element={<BillingInsights />} />
      </Routes>
    </div>
  )
}

export default App
