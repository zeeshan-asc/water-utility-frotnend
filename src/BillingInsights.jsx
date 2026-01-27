import React from 'react';
import { Search, TrendingUp, AlertCircle, AlertTriangle, CheckCircle, Flag, FileText, DollarSign, Target } from 'lucide-react';
import PageNavigation from './PageNavigation';
import './BillingInsights.css';

// Static data
const kpiData = {
    collectionRate: 93.7,
    improvement: 3.7,
    delinquentAccounts: 499,
    outstanding: 186000,
    avgBillAmount: 185,
    customerRevenue: {
        residential: 65,
        commercial: 25,
        industrial: 10
    }
};

const revenuePerCustomerData = [
    { segment: 'Residential', aiSignal: 8, loss: 312, targeted: 291 },
    { segment: 'Commercial', aiSignal: -6, loss: 244, targeted: 202 },
    { segment: 'Industrial', aiSignal: 0, loss: 177, targeted: 154 }
];

const delinquencyAgingData = [
    { bucket: '0-30 days', accounts: 245, amount: 85000, percent: 100 },
    { bucket: '30-60 days', accounts: 142, amount: 52000, percent: 52.5 },
    { bucket: '60-90 days', accounts: 78, amount: 31000, percent: 34 },
    { bucket: '90+ days', accounts: 34, amount: 18000, percent: 20.5 }
];

const customerSegmentData = [
    { segment: 'Residential', customers: 8200, revenue: 1.7, percentTotal: 65, avgBill: 206 },
    { segment: 'Commercial', customers: 380, revenue: 0.7, percentTotal: 25, avgBill: 1711 },
    { segment: 'Industrial', customers: 45, revenue: 0.3, percentTotal: 10, avgBill: 5778 }
];

const collectionsStrategyData = [
    { title: 'Automated Payment Reminders', description: 'Estimated +25% collection improvement', status: 'Implemented', statusColor: 'green' },
    { title: 'Online Payment Portal', description: '40% of customers using self-service', status: 'Active', statusColor: 'blue' },
    { title: 'Delinquent Account Outreach', description: 'Recovery of $25K in past 3 months', status: 'Ongoing', statusColor: 'orange' }
];

const workOrderAnomalies = [
    { id: 'WO-1234', date: '04/15/2024', amount: 250, issue: 'Overbilling for service' },
    { id: 'WO-1554', date: '04/20/2024', amount: 150, issue: 'Duplicate billing record' },
    { id: 'WO-1294', date: '05/14/2024', amount: 200, issue: 'Missing meter reading' },
    { id: 'WO-2234', date: '08/02/2024', amount: 180, issue: 'Unusual usage pattern' }
];

const workOrderReconciliation = [
    { id: 'WO-1234', billingRecord: 'BR-2498', match: 38, status: 'Reconciled' },
    { id: 'WO-1554', billingRecord: 'BR-1198', match: 55, status: 'Reconciled' },
    { id: 'WO-1294', billingRecord: 'BR-2298', match: 0, status: 'Review Needed' },
    { id: 'WO-2234', billingRecord: 'BR-4568', match: 57, status: 'Reconciled' }
];

const riskScoringData = [
    { id: 7213, service: 'Leak Fix', amount: 250, risk: 'HIGH', drivers: 'Irregular billing history in same area' },
    { id: 4982, service: 'Meter Check', amount: 150, risk: 'LOW', drivers: 'Regular task, contractor accuracy 98%' },
    { id: 6098, service: 'Leak Fix', amount: 200, risk: 'MEDIUM', drivers: 'Delay in technician logs' },
    { id: 3546, service: 'Pipe Install', amount: 180, risk: 'HIGH', drivers: 'Irregular billing history in same area' }
];

const billabilityData = [
    { id: 'WO-1234', service: 'Leak Detection', prediction: 'Billable', confidence: 94, reason: 'Utility-owned line, labor + threshold' },
    { id: 'WO-1554', service: 'Meter Installation', prediction: 'Billable', confidence: 88, reason: 'New home install under builder contract' },
    { id: 'WO-1294', service: 'Valve Replacement', prediction: 'Non- Billable', confidence: 78, reason: 'Historical pattern of billed replacements' },
    { id: 'WO-2234', service: 'Pressure Test', prediction: 'Billable', confidence: 90, reason: 'Customer-requested test, no fraud found' }
];

const BillingInsights = () => {
    return (
        <div className="billing-insights-container">
            {/* Page Header */}
            <div className="bi-page-header">
                <h1 className="bi-brand-title">AquaSentinel™</h1>
                <p className="bi-brand-subtitle">CFO Command Intelligence for Financial, Operational, Billing & Compliance Oversight</p>
            </div>

            {/* Tab Navigation */}
            <PageNavigation />

            {/* Executive Summary Section */}
            <div className="bi-executive-summary">
                <div className="bi-search-bar">
                    <Search size={18} className="bi-search-icon" />
                    <span className="bi-search-text">Provide an executive summary of the AI-driven billing reconciliation progress and the associated risk scoring insights.</span>
                </div>
                <div className="bi-summary-content">
                    <p>The <strong>AI-powered billing and work order reconciliation engine</strong> has efficiently reconciled <strong>80%</strong> of all work orders, with <strong>45 discrepancies</strong> remaining unresolved. Through advanced <strong>predictive risk scoring</strong>, the system has identified <strong>12 high-risk work orders</strong> (out of a total of 45), forecasted to potentially generate <strong>$25,000</strong> in billing discrepancies. This proactive anomaly detection provides invaluable foresight, enabling early intervention and targeted <strong>risk mitigation strategies</strong>, which are essential for ensuring seamless billing cycles and minimizing revenue leakage.</p>
                </div>
            </div>

            {/* Collections & Delinquency Analysis */}
            <h2 className="bi-section-title">
                <span className="bi-title-icon">📊</span>
                Collections & Delinquency Analysis
            </h2>

            <div className="bi-kpi-row">
                {/* Collection Rate Card */}
                <div className="bi-kpi-card">
                    <div className="bi-kpi-label">Collection Rate</div>
                    <div className="bi-kpi-value">{kpiData.collectionRate}%</div>
                    <div className="bi-kpi-change positive">
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M4.25 10.625L8.5 6.375L12.75 10.625" stroke="#16A34A" strokeWidth="1.5"/>
                        </svg>
                        +{kpiData.improvement}% improvement
                    </div>
                </div>

                {/* Delinquent Accounts Card */}
                <div className="bi-kpi-card">
                    <div className="bi-kpi-label">Delinquent Accounts</div>
                    <div className="bi-kpi-value">{kpiData.delinquentAccounts}</div>
                    <div className="bi-kpi-change negative">${(kpiData.outstanding / 1000).toFixed(0)}K outstanding</div>
                </div>

                {/* Avg Bill Amount Card */}
                <div className="bi-kpi-card">
                    <div className="bi-kpi-label">Avg Bill Amount</div>
                    <div className="bi-kpi-value">${kpiData.avgBillAmount}</div>
                    <div className="bi-kpi-change neutral">Per month per account</div>
                </div>

                {/* Customer Revenue by Segment Card */}
                <div className="bi-kpi-card bi-revenue-card">
                    <div className="bi-kpi-label">Customer Revenue by Segment</div>
                    <div className="bi-pie-chart">
                        <svg width="92" height="90" viewBox="0 0 92 90">
                            <circle cx="46" cy="45" r="45" fill="#1E4A79" transform="rotate(-57 46 45)" />
                            <path d="M 46 45 L 46 0 A 45 45 0 0 1 91 45 Z" fill="#9BC0DA" transform="rotate(-57 46 45)" />
                            <path d="M 46 45 L 91 45 A 45 45 0 0 1 78 83 Z" fill="#FD9C46" transform="rotate(-57 46 45)" />
                        </svg>
                    </div>
                    <div className="bi-revenue-subtitle">Revenue distribution across customer types</div>
                    <div className="bi-legend-items">
                        <div className="bi-legend-item"><span className="bi-dot residential"></span>Residential: 65%</div>
                        <div className="bi-legend-item"><span className="bi-dot commercial"></span>Commercial: 25%</div>
                        <div className="bi-legend-item"><span className="bi-dot industrial"></span>Industrial: 10%</div>
                    </div>
                </div>
            </div>

            {/* Revenue Per Customer Chart and Delinquency Analysis Row */}
            <div className="bi-two-column-row">
                {/* Revenue Per Customer Chart */}
                <div className="bi-revenue-chart-card">
                    <div className="bi-chart-header">
                        <div>
                            <div className="bi-chart-title">Revenue Per Customer</div>
                            <div className="bi-chart-subtitle">AI insights into revenue trends across key customers types</div>
                        </div>
                        <div className="bi-ai-confidence">
                            <span className="bi-confidence-label">AI Confidence:</span>
                            <span className="bi-confidence-value">High</span>
                        </div>
                    </div>
                    <div className="bi-chart-legend">
                        <div className="bi-legend-item"><span className="bi-legend-circle ai-signal"></span>AI Signal</div>
                        <div className="bi-legend-item"><span className="bi-legend-circle loss"></span>Loss</div>
                    </div>
                    <div className="bi-bar-chart">
                        {revenuePerCustomerData.map((item, idx) => (
                            <div key={idx} className="bi-bar-row">
                                <div className="bi-bar-label">{item.segment}</div>
                                <div className="bi-bar-container">
                                    <div className="bi-bar bi-bar-targeted" style={{ width: `${(item.targeted / 350) * 100}%` }}></div>
                                    <div className="bi-bar bi-bar-loss" style={{ width: `${(item.loss / 350) * 100}%` }}></div>
                                </div>
                                {item.aiSignal !== 0 && idx === 0 && (
                                    <div className="bi-ai-flag" style={{ left: '409px', top: '87px' }}>
                                        <Flag size={10} color="#DC2626" />
                                        <span>AI Signal - residential revenues trending 8% above target</span>
                                    </div>
                                )}
                                {idx === 1 && (
                                    <div className="bi-ai-flag" style={{ left: '296px', top: '62px' }}>
                                        <Flag size={10} color="#DC2626" />
                                        <span>AI Signal - commercial margins trailing segment average</span>
                                    </div>
                                )}
                                {idx === 2 && (
                                    <div className="bi-ai-flag" style={{ left: '226px', top: '109px' }}>
                                        <Flag size={10} color="#DC2626" />
                                        <span>AI Signal - slowly growth may indicate operational change</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="bi-chart-labels">
                            <span>0</span>
                            <span>1K</span>
                            <span>2K</span>
                            <span>3K</span>
                            <span>4K</span>
                            <span>5K</span>
                            <span>6K</span>
                            <span>7K</span>
                        </div>
                    </div>
                    <div className="bi-ai-summary-box">
                        <p><strong>AI Summary:</strong> AI-Insights: Residential segment outpacing growth forecast 8%; commercial accounts lagging average margins by 6%.</p>
                        <p><strong>AI Outlook:</strong> Opportunity to further optimize commercial pricing or resolve potential industrial slowdown.</p>
                    </div>
                </div>

                {/* Delinquency Analysis by Age */}
                <div className="bi-delinquency-card">
                    <div className="bi-card-title">Delinquency Analysis by Age</div>
                    <div className="bi-card-subtitle">Amounts and accounts overdue by duration</div>
                    <div className="bi-delinquency-list">
                        {delinquencyAgingData.map((item, idx) => (
                            <div key={idx} className="bi-delinquency-item">
                                <div className="bi-delinquency-header">
                                    <div>
                                        <div className="bi-bucket-label">{item.bucket}</div>
                                        <div className="bi-account-count">{item.accounts} accounts</div>
                                    </div>
                                    <div className="bi-amount-label">${(item.amount / 1000).toFixed(0)},000</div>
                                </div>
                                <div className="bi-progress-bar">
                                    <div className="bi-progress-bg"></div>
                                    <div className="bi-progress-fill" style={{ width: `${item.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customer Segment Details and Collections Strategy Row */}
            <div className="bi-two-column-row">
                {/* Customer Segment Details */}
                <div className="bi-segment-card">
                    <div className="bi-card-title">Customer Segment Details</div>
                    <div className="bi-card-subtitle">Breakdown by customer type and metrics</div>
                    <div className="bi-segment-tabs">
                        <div className="bi-segment-tab active">Residential</div>
                        <div className="bi-segment-tab">Commercial</div>
                        <div className="bi-segment-tab">Industrial</div>
                    </div>
                    <div className="bi-segment-content">
                        {customerSegmentData.map((segment, idx) => (
                            <div key={idx} className={`bi-segment-column ${idx === 0 ? 'active' : ''}`}>
                                <div className="bi-segment-box">
                                    <div className="bi-segment-row">
                                        <span>Customers</span>
                                        <span className="bi-segment-value">{segment.customers.toLocaleString()}</span>
                                    </div>
                                    <div className="bi-segment-row">
                                        <span>Revenue</span>
                                        <span className="bi-segment-value">${segment.revenue}M</span>
                                    </div>
                                    <div className="bi-segment-row">
                                        <span>% of Total</span>
                                        <span className="bi-segment-value">{segment.percentTotal}%</span>
                                    </div>
                                    <div className="bi-segment-row highlight">
                                        <span>Avg Bill</span>
                                        <span className="bi-segment-value">${segment.avgBill}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Collections Strategy & Performance */}
                <div className="bi-strategy-card">
                    <div className="bi-card-title">Collections Strategy & Performance</div>
                    <div className="bi-card-subtitle">Recommendations to improve collections rate and reduce delinquency</div>
                    <div className="bi-strategy-list">
                        {collectionsStrategyData.map((strategy, idx) => (
                            <div key={idx} className="bi-strategy-item">
                                <div className="bi-strategy-content">
                                    <div className="bi-strategy-title">{strategy.title}</div>
                                    <div className="bi-strategy-description">{strategy.description}</div>
                                </div>
                                <div className={`bi-status-badge ${strategy.statusColor}`}>{strategy.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI-Powered Billing & Work Order Reconciliation Engine */}
            <h2 className="bi-section-title">
                <span className="bi-title-icon">🤖</span>
                AI-Powered Billing & Work Order Reconciliation Engine
            </h2>

            {/* Anomaly Detection and Auto-Reconciliation Tables */}
            <div className="bi-reconciliation-grid">
                {/* Anomaly Detection Table */}
                <div className="bi-table-card">
                    <div className="bi-table-title">AI-Powered Anomaly Detection in Billing and Work Orders</div>
                    <table className="bi-table">
                        <thead>
                            <tr>
                                <th>Work order ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Detected Issue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workOrderAnomalies.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.id}</td>
                                    <td>{item.date}</td>
                                    <td>${item.amount}</td>
                                    <td>{item.issue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Auto-Reconciliation Table */}
                <div className="bi-table-card">
                    <div className="bi-table-title">Auto-Reconciliation of Work Orders with Billing Records</div>
                    <table className="bi-table">
                        <thead>
                            <tr>
                                <th>Work order ID</th>
                                <th>Billing Record</th>
                                <th>Match %</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workOrderReconciliation.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.id}</td>
                                    <td>{item.billingRecord}</td>
                                    <td>{item.match}%</td>
                                    <td className={item.status === 'Reconciled' ? 'status-reconciled' : 'status-review'}>
                                        {item.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Risk Scoring and Billability Tables */}
            <div className="bi-reconciliation-grid">
                {/* Predictive Risk Scoring Table */}
                <div className="bi-table-card">
                    <div className="bi-table-title">Predictive Billing Risk Scoring for Incoming Work Orders</div>
                    <table className="bi-table">
                        <thead>
                            <tr>
                                <th>WO ID</th>
                                <th>Service</th>
                                <th>Amount</th>
                                <th>AI Risk Prediction</th>
                                <th>Key Drivers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riskScoringData.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.id}</td>
                                    <td>{item.service}</td>
                                    <td>${item.amount}</td>
                                    <td>
                                        <div className="bi-risk-bar">
                                            <div className={`bi-risk-indicator ${item.risk.toLowerCase()}`}></div>
                                            <span className={`bi-risk-label ${item.risk.toLowerCase()}`}>{item.risk}</span>
                                        </div>
                                    </td>
                                    <td>{item.drivers}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Billability Classification Table */}
                <div className="bi-table-card">
                    <div className="bi-table-title">AI-Based Billability Classification Model Using Historical Data</div>
                    <table className="bi-table">
                        <thead>
                            <tr>
                                <th>Work order ID</th>
                                <th>Service</th>
                                <th>AI Prediction</th>
                                <th>Confidence</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billabilityData.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.id}</td>
                                    <td>{item.service}</td>
                                    <td>
                                        <span className={`bi-prediction-badge ${item.prediction === 'Billable' ? 'billable' : 'non-billable'}`}>
                                            {item.prediction}
                                        </span>
                                    </td>
                                    <td>{item.confidence}%</td>
                                    <td>{item.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Summary Cards */}
            <div className="bi-bottom-cards">
                <div className="bi-summary-card blue">
                    <div className="bi-summary-icon"><FileText size={24} /></div>
                    <div className="bi-summary-label">Total Work Orders TT Month</div>
                    <div className="bi-summary-value">1234</div>
                </div>
                <div className="bi-summary-card orange">
                    <div className="bi-summary-icon"><DollarSign size={24} /></div>
                    <div className="bi-summary-label">Total Billed</div>
                    <div className="bi-summary-value">$56,789</div>
                </div>
                <div className="bi-summary-card teal">
                    <div className="bi-summary-icon"><AlertTriangle size={24} /></div>
                    <div className="bi-summary-label">Unreconciled Work Orders</div>
                    <div className="bi-summary-value">45</div>
                </div>
                <div className="bi-summary-card green">
                    <div className="bi-summary-icon"><Target size={24} /></div>
                    <div className="bi-summary-label">Predicted High Risk Detected</div>
                    <div className="bi-summary-value">12</div>
                </div>
                <div className="bi-summary-card red">
                    <div className="bi-summary-icon"><AlertTriangle size={24} /></div>
                    <div className="bi-summary-label">Predicted High Risk</div>
                    <div className="bi-summary-value">8%</div>
                </div>
            </div>
        </div>
    );
};

export default BillingInsights;

