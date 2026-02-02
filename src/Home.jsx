import { Link, useLocation } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'
import './Home.css'

function Home() {
  const location = useLocation()

  return (
    <div className="home-page">
      {/* Header & Nav */}
      <header className="header">
        <div className="header-top">
          <div className="utility-exec-title-header">
            <Link to="/">Utility Executive Control</Link>
          </div>
        </div>
        <div className="nav-line-container">

        </div>
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <span className="nav-link-line"></span>
            OVERVIEW
          </Link>
          <Link to="/financial-health" className={`nav-link ${location.pathname === '/financial-health' ? 'active' : ''}`}>
            <span className="nav-link-line"></span>
            FINANCIAL HEALTH <ChevronUp size={10} className="arrow-icon" />
          </Link>
          <Link to="/operations-compliance" className={`nav-link ${location.pathname === '/operations-compliance' ? 'active' : ''}`}>
            <span className="nav-link-line"></span>
            OPERATIONS & COMPLIANCE <ChevronUp size={10} className="arrow-icon" />
          </Link>
          <Link to="/billing-insights" className={`nav-link ${location.pathname === '/billing-insights' ? 'active' : ''}`}>
            <span className="nav-link-line"></span>
            BILLING INSIGHTS <ChevronUp size={10} className="arrow-icon" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="hero-content">
          <h1 className="brand-name">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>AquaSentinel™</Link>
          </h1>
          <p className="brand-description">
            Unified, real-time oversight of financial performance, operational risk, regulatory exposure, and customer revenue.
          </p>

          <div className="hero-bullets">
            <div className="bullet-item">
              <span className="bullet-icon" style={{ mask: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"%3E%3Cpath d=\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h2v4zm0-6h-2V7h2v4z\"/%3E%3C/svg%3E') no-repeat center" }}></span>
              <span>Unified view of financial, operational, and billing performance</span>
            </div>
            <div className="bullet-item">
              <span className="bullet-icon" style={{ mask: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"%3E%3Cpath d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z\"/%3E%3C/svg%3E') no-repeat center" }}></span>
              <span>Early detection of compliance, cost, and revenue risks</span>
            </div>
            <div className="bullet-item">
              <span className="bullet-icon" style={{ mask: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"%3E%3Cpath d=\"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z\"/%3E%3C/svg%3E') no-repeat center" }}></span>
              <span>Decision-ready insights designed for utility finance leaders</span>
            </div>
          </div>

          <div className="search-bar-container">
            <span className="search-icon"></span>
            <input type="text" className="search-input" placeholder="Search..." />
          </div>
        </div>
      </section>

      {/* Strategic Pillars Section */}
      <section className="pillars-section">
        <h2 className="pillars-main-title">STRATEGIC FINANCIAL PILLARS</h2>

        <div className="pillars-grid">
          {/* Pillar 1 */}
          <Link to="/financial-health" className="pillar-card">
            <div className="pillar-icon-circle">
              <div className="pillar-icon-img" style={{ mask: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"%3E%3Cpath d=\"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z\"/%3E%3C/svg%3E') no-repeat center" }}></div>
            </div>
            <h3 className="pillar-title">FINANCIAL HEALTH</h3>
            <p className="pillar-subtitle">Forecasts · Margins · Risk Oversight</p>
            <p className="pillar-description">
              Gain real-time visibility into financial performance, budget variance, debt sustainability, and efficiency risks for confident executive decision-making.
            </p>
          </Link>

          {/* Pillar 2 */}
          <Link to="/operations-compliance" className="pillar-card">
            <div className="pillar-icon-circle">
              <div className="pillar-icon-img" style={{ mask: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"%3E%3Cpath d=\"M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84a.483.483 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.487.487 0 0 0-.59.22L3.06 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94 0 .31.02.65.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.32l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.27.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47.01.59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z\"/%3E%3C/svg%3E') no-repeat center" }}></div>
            </div>
            <h3 className="pillar-title">Operations & Compliance</h3>
            <p className="pillar-subtitle">Operations · Compliance · System Readiness</p>
            <p className="pillar-description">
              Monitor water quality performance, compliance, and operational readiness in real time to support proactive executive oversight.
            </p>
          </Link>

          {/* Pillar 3 */}
          <Link to="/billing-insights" className="pillar-card">
            <div className="pillar-icon-circle">
              <div className="pillar-icon-img" style={{ mask: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"%3E%3Cpath d=\"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z\"/%3E%3C/svg%3E') no-repeat center" }}></div>
            </div>
            <h3 className="pillar-title">Billing Insights</h3>
            <p className="pillar-subtitle">Collections · Revenue Integrity · Billing Accuracy</p>
            <p className="pillar-description">
              Track collections, revenue patterns, and billing anomalies in real time to strengthen cash flow and executive oversight.
            </p>
          </Link>
        </div>

        <p className="pillars-footer-text">
          Purpose-built for utility finance leadership to integrate financial outcomes, operational discipline, and regulatory accountability.
        </p>
      </section>
    </div>
  )
}

export default Home
