import React from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { AlertCircle, CheckCircle, Activity, Search, TrendingUp, TrendingDown, Settings, Droplet } from 'lucide-react';
import PageNavigation from './PageNavigation';
import './OperationsCompliance.css';

// Data
// Data
const systemReliabilityData = [
    { month: 'Jan', uptime: 99.2, incidents: 2 },
    { month: 'Feb', uptime: 99.4, incidents: 3 },
    { month: 'Mar', uptime: 99.7, incidents: 4 },
    { month: 'Apr', uptime: 99.8, incidents: 1 },
    { month: 'May', uptime: 99.7, incidents: 1 },
    { month: 'Jun', uptime: 99.1, incidents: 2 },
];

const nrwData = [
    { month: 'May', targeted: 5, loss: 8.5 },
    { month: 'Apr', targeted: 6, loss: 7 },
    { month: 'Mar', targeted: 5, loss: 5 },
    { month: 'Feb', targeted: 6, loss: 6.5 },
    { month: 'Jan', targeted: 5, loss: 4 },
];

const pipeAgeData = [
    { age: '0-10', miles: 425, cumulative: 15 },
    { age: '10-20', miles: 380, cumulative: 30 },
    { age: '20-30', miles: 310, cumulative: 50 },
    { age: '30-40', miles: 255, cumulative: 70 },
    { age: '50-60', miles: 200, cumulative: 85 },
    { age: '60+', miles: 125, cumulative: 100 },
];

const labThroughputData = [
    { month: 'Jan', actual: 200, predicted: 180 },
    { month: 'Feb', actual: 275, predicted: 240 },
    { month: 'Mar', actual: 310, predicted: 280 },
    { month: 'Apr', actual: 350, predicted: 330 },
    { month: 'May', actual: 425, predicted: 390 },
    { month: 'Jun', actual: 460, predicted: 420 },
    { month: 'Jul', actual: null, predicted: 510 },
    { month: 'Aug', actual: null, predicted: 540 },
];

const leadLevelsData = [
    { month: 'Jan', level: 12 },
    { month: 'Feb', level: 10 },
    { month: 'Mar', level: 14 },
    { month: 'Apr', level: 8 },
    { month: 'May', level: 6 },
    { month: 'Jun', level: 4 },
    { month: 'Jul', level: 3 },
    { month: 'Aug', level: 3.5 },
];

const OperationsCompliance = () => {
    return (
        <div className="operations-compliance-container">
            {/* Page Header */}
            <div className="oc-page-header">
                <h1 className="oc-brand-title">AquaSentinel™</h1>
                <div className="oc-brand-subtitle">CFO Command Intelligence for Financial, Operational, Billing & Compliance Oversight</div>
            </div>

            {/* Tab Navigation */}
            <PageNavigation />

            {/* AI Query Section */}
            <div className="oc-ai-section">
                <div className="oc-search-bar">
                    <Search size={18} className="oc-search-icon" />
                    <span className="oc-search-text">How is the utility performing in predictive compliance and future regulatory readiness?</span>
                </div>
                <div className="oc-ai-response-box">
                    The utility’s predictive compliance models show <strong>92% accuracy</strong> in identifying risks, though continuous updates are needed to stay aligned with evolving regulations. With an <strong>88% regulatory readiness score</strong>, the foundation is strong, but enhanced staff training and process optimization are crucial for full compliance. Focusing on predictive analytics and ongoing staff education will mitigate risks and ensure smoother transitions to future regulatory standards.
                </div>
            </div>

            {/* System Stability & Maintenance Outlook */}
            <h2 className="oc-section-title">
                <Settings size={24} className="oc-section-icon" />
                System Stability & Maintenance Outlook
            </h2>

            <div className="oc-stability-grid">
                {/* Row 1 */}
                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">System Uptime</div>
                    <div className="oc-kpi-value">99.7%</div>
                    <div className="oc-kpi-target safe">
                        <CheckCircle size={14} />
                        Target: 99.5%
                    </div>
                </div>

                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">Water Loss Rate</div>
                    <div className="oc-kpi-value">5.2%</div>
                    <div className="oc-kpi-target safe">Below 8% target</div>
                </div>

                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">Treatment Capacity</div>
                    <div className="oc-kpi-value">85%</div>
                    <div className="oc-kpi-target warning">Target: &lt;80%</div>
                </div>

                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">Pipe Breaks/1000mi</div>
                    <div className="oc-kpi-value">8.2</div>
                    <div className="oc-kpi-target danger">Target: &lt;5</div>
                </div>

                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">Customer Response Time</div>
                    <div className="oc-kpi-value">2.1 hrs</div>
                    <div className="oc-kpi-target safe">
                        <CheckCircle size={14} />
                        Target: &lt;4 hrs
                    </div>
                </div>

                {/* Row 2 */}
                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">Asset Condition Index</div>
                    <div className="oc-kpi-value">65%</div>
                    <div className="oc-kpi-target warning">Target: &gt;70%</div>
                </div>

                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">Active Incidents</div>
                    <div className="oc-kpi-value">3</div>
                    <div className="oc-kpi-target warning">2 in progress</div>
                </div>

                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">Pump Efficiency</div>
                    <div className="oc-kpi-value">96.2%</div>
                    <div className="oc-kpi-target safe">Optimal Performance</div>
                </div>

                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">System Status</div>
                    <div className="oc-kpi-value">Operational</div>
                    <div className="oc-kpi-target safe">99.8% uptime</div>
                </div>

                <div className="oc-kpi-card">
                    <div className="oc-kpi-label">Unplanned Incidents</div>
                    <div className="oc-kpi-value">13</div>
                    <div className="oc-kpi-target warning">YTD - Trending</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="oc-charts-row">
                <div className="oc-chart-card">
                    <div className="oc-chart-header">
                        <div className="oc-chart-title">System Reliability Trend - Uptime vs Incidents</div>
                        <div className="oc-chart-legend">
                            <span className="legend-item"><span className="dot" style={{ background: '#FD9C46' }}></span> System Uptime %</span>
                            <span className="legend-item"><span className="dot" style={{ background: '#1B5B7E' }}></span> Incidents</span>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <ComposedChart data={systemReliabilityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
                                <YAxis yAxisId="left" fontSize={10} domain={[98.5, 100]} tickLine={false} axisLine={false} label={{ value: 'Uptime %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6B7280' }} />
                                <YAxis yAxisId="right" orientation="right" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Incidents', angle: 90, position: 'insideRight', fontSize: 10, fill: '#6B7280' }} />
                                <Tooltip />
                                <Bar yAxisId="right" dataKey="incidents" fill="#1B5B7E" barSize={30} radius={[4, 4, 0, 0]} />
                                <Line yAxisId="left" type="monotone" dataKey="uptime" stroke="#FD9C46" strokeWidth={2} dot={{ r: 4, fill: '#FD9C46', strokeWidth: 2, stroke: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="oc-chart-card">
                    <div className="oc-chart-header">
                        <div className="oc-chart-title">Non-Revenue Water Trend</div>
                        <div className="oc-chart-chip">AI Confidence: High</div>
                    </div>
                    <div className="oc-chart-subtitle">AI-driven insights into unbilled, lost, or leaked water</div>
                    <div className="oc-chart-legend-small">
                        <span className="legend-item"><span className="dot" style={{ background: '#689EC2' }}></span> Targeted</span>
                        <span className="legend-item"><span className="dot" style={{ background: '#1B5B7E' }}></span> Loss</span>
                    </div>
                    <div style={{ width: '100%', height: 180, position: 'relative' }}>
                        <ResponsiveContainer>
                            <BarChart data={nrwData} layout="vertical" barGap={2} barCategoryGap={15}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" fontSize={10} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} domain={[0, 16]} />
                                <YAxis dataKey="month" type="category" fontSize={10} tickLine={false} axisLine={false} width={30} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="loss" fill="#1B5B7E" barSize={10} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="targeted" fill="#689EC2" barSize={10} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="oc-ai-alert-overlay" style={{ top: '30%', left: '50%' }}>
                            <div className="ai-flag-pulsing">
                                <AlertCircle size={10} color="#DC2626" />
                                <span>AI Signal - loss exceeded target by 32%</span>
                            </div>
                        </div>
                    </div>
                    <div className="oc-ai-summary-box">
                        <div className="ai-summary-line"><strong>AI Summary:</strong> Steady upward trend in NRW loss; leak probability increasing in Zones 4 and 7.</div>
                        <div className="ai-summary-line" style={{ marginTop: '4px' }}><strong>AI Outlook:</strong> NRW loss projected to worsen by ~11% in the next two months.</div>
                    </div>
                </div>

                <div className="oc-chart-card">
                    <div className="oc-chart-title">Infrastructure Renewal View: Pipe Miles by Age + Cumulative Exposure</div>
                    <div className="oc-chart-legend" style={{ justifyContent: 'flex-end', marginTop: 5 }}>
                        <span className="legend-item"><span className="line-legend" style={{ borderTop: '2px solid #FD9C46', width: 12 }}></span> Cumulative % of Network</span>
                        <span className="legend-item"><span className="dot" style={{ background: '#1B5B7E' }}></span> Miles of Pipe</span>
                    </div>
                    <div style={{ width: '100%', height: 220, position: 'relative' }}>
                        <ResponsiveContainer>
                            <ComposedChart data={pipeAgeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="age" fontSize={10} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} label={{ value: 'Pipe Age (Years)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#6B7280' }} />
                                <YAxis yAxisId="left" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Miles of Pipe', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6B7280' }} />
                                <YAxis yAxisId="right" orientation="right" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Cumulative % of Total Network', angle: 90, position: 'insideRight', fontSize: 10, fill: '#6B7280' }} />
                                <Tooltip />
                                <Bar yAxisId="left" dataKey="miles" fill="#1B5B7E" barSize={40} radius={[2, 2, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#FD9C46" strokeWidth={2} dot={{ r: 4, fill: '#FD9C46', strokeWidth: 2, stroke: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <div className="oc-chart-annotation" style={{ top: '10%', right: '20%', fontSize: 9, color: '#1B5B7E', width: 80, textAlign: 'center' }}>
                            High-Risk Segment (30+ yrs) 370 miles (25.5%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Risk Signals */}
            <h2 className="oc-section-title">Operational Risk Signals</h2>

            <div className="oc-risk-grid">
                <div className="oc-risk-card">
                    <div className="oc-risk-header">
                        <AlertCircle size={18} color="#DC2626" className="risk-icon-bg" />
                        <span className="oc-risk-title">Aging Infrastructure</span>
                    </div>
                    <div className="oc-risk-signal">AI Signal: Failure risk trending upward in high-age assets</div>
                    <div className="oc-risk-action">Accelerate replacement program</div>
                    <div className="oc-risk-priority" style={{ color: '#DC2626' }}>Priority: HIGH</div>
                    <button className="oc-risk-button">Take Action</button>
                </div>

                <div className="oc-risk-card">
                    <div className="oc-risk-header">
                        <TrendingUp size={18} color="#FD9C46" className="risk-icon-bg warning" />
                        <span className="oc-risk-title">Water Loss from Leaks</span>
                    </div>
                    <div className="oc-risk-signal">AI Signal: Flow anomalies indicate rising non-revenue water</div>
                    <div className="oc-risk-action">Deploy leak detection sensor</div>
                    <div className="oc-risk-priority" style={{ color: '#FD9C46' }}>Priority: MEDIUM</div>
                    <button className="oc-risk-button">Take Action</button>
                </div>

                <div className="oc-risk-card">
                    <div className="oc-risk-header">
                        <Activity size={18} color="#FD9C46" className="risk-icon-bg warning" />
                        <span className="oc-risk-title">Peak Demand Stress</span>
                    </div>
                    <div className="oc-risk-signal">AI Signal: Peak demand exceeding historical capacity thresholds</div>
                    <div className="oc-risk-action">Invest in storage capacity</div>
                    <div className="oc-risk-priority" style={{ color: '#FD9C46' }}>Priority: MEDIUM</div>
                    <button className="oc-risk-button">Take Action</button>
                </div>

                <div className="oc-risk-card">
                    <div className="oc-risk-header">
                        <AlertCircle size={18} color="#DC2626" className="risk-icon-bg" />
                        <span className="oc-risk-title">Regulatory Change (PFOA)</span>
                    </div>
                    <div className="oc-risk-signal">AI Signal: Compliance thresholds projected to tighten soon</div>
                    <div className="oc-risk-action">Plan treatment upgrades</div>
                    <div className="oc-risk-priority" style={{ color: '#DC2626' }}>Priority: HIGH</div>
                    <button className="oc-risk-button">Take Action</button>
                </div>
            </div>

            {/* AI-Anticipated Maintenance */}
            <div className="oc-maintenance-section">
                <h2 className="oc-section-title" style={{ marginTop: 0 }}>AI-Anticipated Maintenance</h2>
                <div className="oc-maintenance-list">
                    <div className="oc-maintenance-item">
                        <div className="oc-maintenance-info">
                            <div className="oc-maintenance-title">Primary Pump Overhaul</div>
                            <div className="oc-maintenance-schedule">Scheduled: Jan 15, 2024</div>
                        </div>
                        <span className="oc-status-badge scheduled">Scheduled</span>
                    </div>
                    <div className="oc-maintenance-item">
                        <div className="oc-maintenance-info">
                            <div className="oc-maintenance-title">Chlorine System Inspection</div>
                            <div className="oc-maintenance-schedule">Scheduled: Jan 22, 2024</div>
                        </div>
                        <span className="oc-status-badge scheduled">Scheduled</span>
                    </div>
                    <div className="oc-maintenance-item">
                        <div className="oc-maintenance-info">
                            <div className="oc-maintenance-title">Pipeline Pressure Test - Zone A</div>
                            <div className="oc-maintenance-schedule">In Progress</div>
                        </div>
                        <span className="oc-status-badge in-progress">In Progress</span>
                    </div>
                </div>
            </div>

            {/* Water Quality & Regulatory Compliance */}
            <h2 className="oc-section-title">
                <Activity size={22} />
                Water Quality & Regulatory Compliance
            </h2>

            <div className="oc-quality-compliance-row">
                <div className="oc-quality-card">
                    <div className="oc-quality-metric">Chlorine Residual</div>
                    <div className="oc-quality-value">0.8 mg/L</div>
                    <div className="oc-quality-status safe">Target: 0.5-1.0 mg/L</div>
                </div>

                <div className="oc-quality-card">
                    <div className="oc-quality-metric">Turbidity</div>
                    <div className="oc-quality-value">0.12 NTU</div>
                    <div className="oc-quality-status safe">Limit: &lt;0.5 NTU</div>
                </div>

                <div className="oc-quality-card">
                    <div className="oc-quality-metric">PFAS Levels</div>
                    <div className="oc-quality-value">78 ppt</div>
                    <div className="oc-quality-status critical">Exceeds EPA limit (70 ppt)</div>
                </div>

                <div className="oc-quality-card oc-circular-score-card">
                    <div className="oc-circular-score">
                        <div className="score-title">At Risk</div>
                        <svg width="135.33" height="129.31" viewBox="0 0 135.33 129.31" style={{ marginTop: '10px' }}>
                            {/* Background gray circle */}
                            <circle cx="67.665" cy="64.655" r="60" fill="none" stroke="#D9D9D9" strokeWidth="12" />
                            {/* Blue progress circle - 87% filled */}
                            <circle cx="67.665" cy="64.655" r="60" fill="none" stroke="#689EC2" strokeWidth="12" 
                                strokeDasharray="377" strokeDashoffset="49" transform="rotate(-90 67.665 64.655)" strokeLinecap="round" />
                            {/* Large score number */}
                            <text x="67.665" y="55" textAnchor="middle" fontSize="25.5619" fontWeight="600" fill="#1B5B7E">87</text>
                            {/* Score fraction */}
                            <text x="67.665" y="70" textAnchor="middle" fontSize="15.0364" fontWeight="600" fill="#1B5B7E">87/100</text>
                            {/* Trend indicator with green text - positioned below 87/100 */}
                            <text x="67.665" y="85" textAnchor="middle" fontSize="9.02185" fill="#16A34A">
                                <tspan>+1.5%</tspan>
                                <tspan dx="3">In Compliance</tspan>
                            </text>
                            {/* Compliance Score label at bottom */}
                            <text x="67.665" y="100" textAnchor="middle" fontSize="9.02185" fill="#073356">Compliance Score</text>
                        </svg>
                        <div className="score-details">Chlorine: 0.05 mg/L, PFAS: 0.01 ng/L</div>
                    </div>
                </div>
            </div>

            {/* Compliance & Heatmap */}
            <div className="oc-compliance-row">
                <div className="oc-compliance-card">
                    <div className="oc-compliance-title">Compliance to Regulatory Standards</div>
                    <div className="oc-chart-subtitle">Current status of all major compliance requirements</div>

                    <div style={{ marginTop: '20px' }}>
                        {[
                            { label: 'Water Quality Standards', value: 100, status: 'green', icon: 'check' },
                            { label: 'EPA Requirements', value: 98, status: 'orange', icon: 'check' },
                            { label: 'Safe Drinking Water Act', value: 100, status: 'green', icon: 'check' },
                            { label: 'Local Regulations', value: 85, status: 'orange', icon: 'warning' },
                            { label: 'System Maintenance', value: 92, status: 'orange', icon: 'check' },
                        ].map((item, i) => (
                            <div key={i} className="oc-compliance-item">
                                {item.icon === 'check' ? (
                                    <CheckCircle size={14} color={item.status === 'green' ? '#16A34A' : '#FD9C46'} />
                                ) : (
                                    <AlertCircle size={14} color="#FD9C46" />
                                )}
                                <strong>{item.label}</strong>
                                <div className="oc-compliance-bar">
                                    <div className={`oc-compliance-fill ${item.status}`} style={{ width: `${item.value}%` }}></div>
                                </div>
                                <span className="oc-compliance-percentage">{item.value.toFixed(2)}%</span>
                            </div>
                        ))}
                    </div>
                    <p className="oc-compliance-alert">
                        2 compliance alerts requiring attention. PFAS levels at 3 of 5 monitoring stations exceed EPA thresholds.
                    </p>
                </div>

                <div className="oc-compliance-card">
                    <div className="oc-compliance-title">Water Quality Heatmap by Stations</div>
                    <div className="oc-chart-subtitle">Monitoring station results and compliance status</div>

                    <div className="oc-station-dropdown">
                        <span>Station</span>
                        <span>All</span>
                    </div>

                    <table className="oc-heatmap-table">
                        <thead>
                            <tr>
                                <th>Station</th>
                                <th>Chlorine<br />(0.5-1.0)</th>
                                <th>Turbidity<br />(&lt;0.5 NTU)</th>
                                <th>PFAS<br />(&lt;70 ppt)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Treatment Plant 1</td>
                                <td>
                                    <div className="oc-heatmap-cell safe">0.8</div>
                                    <div className="oc-heatmap-label">Safe</div>
                                </td>
                                <td>
                                    <div className="oc-heatmap-cell safe">0.12</div>
                                    <div className="oc-heatmap-label">Safe</div>
                                </td>
                                <td>
                                    <div className="oc-heatmap-cell safe">42</div>
                                    <div className="oc-heatmap-label">Safe</div>
                                </td>
                            </tr>
                            <tr>
                                <td>Downtown Station</td>
                                <td>
                                    <div className="oc-heatmap-cell warning">0.65</div>
                                    <div className="oc-heatmap-label">Warning</div>
                                </td>
                                <td>
                                    <div className="oc-heatmap-cell warning">0.28</div>
                                    <div className="oc-heatmap-label">Warning</div>
                                </td>
                                <td>
                                    <div className="oc-heatmap-cell warning">58</div>
                                    <div className="oc-heatmap-label">Warning</div>
                                </td>
                            </tr>
                            <tr>
                                <td>North Zone</td>
                                <td>
                                    <div className="oc-heatmap-cell safe">0.9</div>
                                    <div className="oc-heatmap-label">Safe</div>
                                </td>
                                <td>
                                    <div className="oc-heatmap-cell safe">0.09</div>
                                    <div className="oc-heatmap-label">Safe</div>
                                </td>
                                <td>
                                    <div className="oc-heatmap-cell critical">78</div>
                                    <div className="oc-heatmap-label">Critical</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Predictive Compliance Calendar */}
            <div className="oc-calendar-section">
                <div className="oc-calendar-header">
                    <Settings size={18} />
                    <span>Predictive Compliance Calendar</span>
                </div>

                <div className="oc-calendar-grid">
                    <div className="oc-calendar-item">
                        <div className="oc-calendar-item-header">
                            <span className="oc-calendar-item-title">Routine Bacterial Testing</span>
                            <span className="oc-risk-badge low">Low Risk</span>
                        </div>
                        <div className="oc-calendar-due">Due Date: Dec 28, 2024</div>
                        <div className="oc-calendar-days">
                            <span>Days</span>
                            <span>4</span>
                        </div>
                        <div className="oc-calendar-progress-label">Completion Progress</div>
                        <div className="oc-calendar-progress-row">
                            <div className="oc-calendar-progress">
                                <div className="oc-calendar-progress-fill" style={{ width: '98%' }}></div>
                            </div>
                            <span className="oc-calendar-progress-value">98%</span>
                        </div>
                        <div className="oc-calendar-decision">Decision Support: Likely to meet deadline</div>
                        <span className="oc-status-badge on-track">On Track</span>
                    </div>

                    <div className="oc-calendar-item">
                        <div className="oc-calendar-item-header">
                            <span className="oc-calendar-item-title">PFAS Monitoring (Quarterly)</span>
                            <span className="oc-risk-badge medium">Medium Risk</span>
                        </div>
                        <div className="oc-calendar-due">Due Date: Dec 31, 2024</div>
                        <div className="oc-calendar-days">
                            <span>Days</span>
                            <span>7</span>
                        </div>
                        <div className="oc-calendar-progress-label">Completion Progress</div>
                        <div className="oc-calendar-progress-row">
                            <div className="oc-calendar-progress">
                                <div className="oc-calendar-progress-fill" style={{ width: '92%' }}></div>
                            </div>
                            <span className="oc-calendar-progress-value">92%</span>
                        </div>
                        <div className="oc-calendar-decision">Decision Support: Likely to meet deadline</div>
                        <span className="oc-status-badge on-track">On Track</span>
                    </div>

                    <div className="oc-calendar-item">
                        <div className="oc-calendar-item-header">
                            <span className="oc-calendar-item-title">Disinfection Byproducts (DBP)</span>
                            <span className="oc-risk-badge high">At Risk</span>
                        </div>
                        <div className="oc-calendar-due">Due Date: Jan 4, 2025</div>
                        <div className="oc-calendar-days">
                            <span>Days</span>
                            <span>11</span>
                        </div>
                        <div className="oc-calendar-progress-label">Completion Progress</div>
                        <div className="oc-calendar-progress-row">
                            <div className="oc-calendar-progress">
                                <div className="oc-calendar-progress-fill" style={{ width: '78%' }}></div>
                            </div>
                            <span className="oc-calendar-progress-value">78%</span>
                        </div>
                        <div className="oc-calendar-decision">Decision Support: Recommend acceleration of sampling</div>
                        <span className="oc-status-badge at-risk">At Risk</span>
                    </div>

                    <div className="oc-calendar-item">
                        <div className="oc-calendar-item-header">
                            <span className="oc-calendar-item-title">Cross-Connection Testing</span>
                            <span className="oc-risk-badge high">At Risk</span>
                        </div>
                        <div className="oc-calendar-due">Due Date: Jan 15, 2025</div>
                        <div className="oc-calendar-days">
                            <span>Days</span>
                            <span>22</span>
                        </div>
                        <div className="oc-calendar-progress-label">Completion Progress</div>
                        <div className="oc-calendar-progress-row">
                            <div className="oc-calendar-progress">
                                <div className="oc-calendar-progress-fill" style={{ width: '45%' }}></div>
                            </div>
                            <span className="oc-calendar-progress-value">45%</span>
                        </div>
                        <div className="oc-calendar-decision">Decision Support: Recommend acceleration of sampling</div>
                        <span className="oc-status-badge at-risk">At Risk</span>
                    </div>
                </div>
            </div>

            {/* Lab Operational Readiness */}
            <h2 className="oc-section-title">
                <Activity size={22} className="oc-section-icon" />
                Lab Operational Readiness
            </h2>

            <div className="oc-lab-grid">
                <div className="oc-lab-card">
                    <div className="oc-lab-card-title">Program Samples Collected</div>
                    <div className="oc-lab-inner-box">
                        <div className="oc-lab-big-value">34,120</div>
                        <div className="oc-lab-unit">Samples</div>
                    </div>
                </div>

                <div className="oc-lab-card">
                    <div className="oc-lab-card-title">YTD Water Quality Tests Completed</div>
                    <div className="oc-gauge-container">
                        <Gauge
                            width={300}
                            height={180}
                            value={7520}
                            valueMin={0}
                            valueMax={9000}
                            startAngle={-90}
                            endAngle={90}
                            sx={{
                                [`& .${gaugeClasses.valueText}`]: {
                                    display: 'none',
                                },
                                [`& .${gaugeClasses.valueArc}`]: {
                                    fill: '#6fa3c8',
                                },
                                [`& .${gaugeClasses.referenceArc}`]: {
                                    fill: '#e5e5e5',
                                },
                            }}
                        />
                        <div className="oc-gauge-text-container">
                            <div className="oc-gauge-value">7520</div>
                            <div className="oc-gauge-subtext">83.5% of Annual Target</div>
                            <div className="oc-gauge-target">Target: 9,000</div>
                        </div>
                    </div>
                </div>

                <div className="oc-lab-card">
                    <div className="oc-lab-card-title">YTD Contaminant Exceedances Identified</div>
                    <div className="oc-gauge-container">
                        <Gauge
                            width={300}
                            height={180}
                            value={38}
                            valueMin={0}
                            valueMax={50}
                            startAngle={-90}
                            endAngle={90}
                            sx={{
                                [`& .${gaugeClasses.valueText}`]: {
                                    display: 'none',
                                },
                                [`& .${gaugeClasses.valueArc}`]: {
                                    fill: '#6fa3c8',
                                },
                                [`& .${gaugeClasses.referenceArc}`]: {
                                    fill: '#e5e5e5',
                                },
                            }}
                        />
                        <div className="oc-gauge-text-container">
                            <div className="oc-gauge-value">38</div>
                            <div className="oc-gauge-subtext">Threshold: &lt;50 per year</div>
                            <div className="oc-gauge-footer">Based on regulatory and internal safety thresholds</div>
                        </div>
                    </div>
                </div>

                <div className="oc-lab-card">
                    <div className="oc-lab-card-title">Sampling Compliance Rate</div>
                    <div className="oc-lab-split">
                        <div className="oc-lab-inner-box">
                            <div className="oc-lab-big-value">98.2%</div>
                            <div className="oc-lab-unit">Compliance Rate</div>
                        </div>
                        <div className="oc-lab-inner-box">
                            <div className="oc-lab-big-value">12.3%</div>
                            <div className="oc-lab-unit">Retest or Investigation Required</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sampling Compliance Status */}
            <div className="oc-sampling-section">
                <div className="oc-section-subtitle">Sampling Compliance Status</div>
                <div className="oc-sampling-list-container">
                    <div className="oc-sampling-scroll-area">
                        <div className="oc-sampling-item safe">
                            <div className="oc-sampling-content">
                                <div className="oc-sampling-main">
                                    <div className="oc-sampling-name">Routine Sampling</div>
                                    <div className="oc-sampling-progress-wrapper">
                                        <div className="oc-sampling-progress-track">
                                            <div className="oc-sampling-progress-fill safe" style={{ width: '98%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="oc-sampling-meta">
                                    <span className="oc-sampling-badge safe">98% Complete</span>
                                    <div className="oc-sampling-detail">156 of 159 samples submitted on time</div>
                                </div>
                            </div>
                        </div>

                        <div className="oc-sampling-item warning">
                            <div className="oc-sampling-content">
                                <div className="oc-sampling-main">
                                    <div className="oc-sampling-name">PFAS Testing</div>
                                    <div className="oc-sampling-progress-wrapper">
                                        <div className="oc-sampling-progress-track">
                                            <div className="oc-sampling-progress-fill warning" style={{ width: '92%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="oc-sampling-meta">
                                    <span className="oc-sampling-badge warning">92% Complete</span>
                                    <div className="oc-sampling-detail">23 of 25 stations sampled (2 pending)</div>
                                </div>
                            </div>
                        </div>

                        <div className="oc-sampling-item danger">
                            <div className="oc-sampling-content">
                                <div className="oc-sampling-main">
                                    <div className="oc-sampling-name">DBP Monitoring</div>
                                    <div className="oc-sampling-progress-wrapper">
                                        <div className="oc-sampling-progress-track">
                                            <div className="oc-sampling-progress-fill danger" style={{ width: '11%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="oc-sampling-meta">
                                    <span className="oc-sampling-badge danger">11% Complete</span>
                                    <div className="oc-sampling-detail">1 of 9 samples submitted (deadline: 2 days)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="oc-custom-scrollbar">
                        <div className="oc-scrollbar-track"></div>
                        <div className="oc-scrollbar-thumb"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Charts Row */}
            <div className="oc-bottom-charts">
                <div className="oc-chart-card">
                    <div className="oc-chart-header-row">
                        <div className="oc-compliance-title">Lab Throughput & Sample Volume Trend</div>
                        <div className="oc-legend-custom">
                            <span className="legend-item"><span className="dot predicted"></span> AI Predicted</span>
                            <span className="legend-item"><span className="dot actual"></span> Actual</span>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 240 }}>
                        <ResponsiveContainer>
                            <LineChart data={labThroughputData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" fontSize={11} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="predicted" stroke="#FD9C46" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#FD9C46' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="actual" stroke="#689EC2" strokeWidth={3} dot={{ r: 4, fill: '#689EC2' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="oc-chart-card" style={{ position: 'relative' }}>
                    <div className="oc-chart-header-row">
                        <div className="oc-compliance-title">Lead Levels in Water</div>
                        <div className="oc-compliance-action-badge">Contaminant <span className="action-val">Lead</span></div>
                    </div>
                    <div className="oc-chart-subtitle" style={{ color: '#FD9C46', fontWeight: 600 }}>Action Level 19 ppb</div>

                    {/* Anomaly Overlay */}
                    <div className="oc-anomaly-overlay" style={{ top: '80px', left: '160px' }}>
                        <div className="oc-anomaly-header">
                            <AlertCircle size={10} color="white" /> Anomaly detected: 14 ppb in February, +38% above expected
                        </div>
                        <button className="oc-anomaly-btn">View Details</button>
                    </div>

                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <AreaChart data={leadLevelsData}>
                                <defs>
                                    <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#689EC2" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#689EC2" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" fontSize={11} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} label={{ value: 'Contaminant Concentration (ppb)', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#6B7280' }} />
                                <Tooltip />
                                <ReferenceLine y={19} stroke="#FD9C46" strokeDasharray="3 3" strokeWidth={2} />
                                <Area type="monotone" dataKey="level" stroke="#689EC2" strokeWidth={3} fill="url(#leadGradient)" dot={{ r: 4, fill: '#689EC2' }} />
                                {/* Red dot for Feb */}
                                <ReferenceLine x="Feb" stroke="none" label={<Dot r={5} fill="#DC2626" cx="120" cy="80" />} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section Grid: Monitor (Left) & Outreach (Right) */}
            <div className="oc-bottom-grid">
                {/* Chemical and Microbiological Monitoring */}
                <div className="oc-monitoring-section">
                    <h2 className="oc-section-title" style={{ fontSize: '18px', marginBottom: '20px' }}>Chemical and Microbiological Monitoring</h2>
                    <div className="oc-monitoring-table-container">
                        <table className="oc-monitoring-table">
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', paddingLeft: '20px' }}>Facility</th>
                                    <th>pH Range</th>
                                    <th>Free Chlorine</th>
                                    <th>Total Coliform</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="fw-bold">Primary Filtration Zone</td>
                                    <td>7.2-7.8</td>
                                    <td>1.1 mg/L</td>
                                    <td>0%</td>
                                    <td><div className="status-icon success"><CheckCircle size={14} /></div></td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">Raw Water Intake</td>
                                    <td>7.0-7.6</td>
                                    <td>0.8 mg/L</td>
                                    <td>1.5%</td>
                                    <td><div className="status-icon danger"><AlertCircle size={14} /></div></td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">Disinfection & Chemical Dosing Facility</td>
                                    <td>7.23</td>
                                    <td>1.0 mg/L</td>
                                    <td>0%</td>
                                    <td><div className="status-icon success"><CheckCircle size={14} /></div></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Outreach, Investigations & Notifications */}
                <div className="oc-outreach-section">
                    <h2 className="oc-section-title" style={{ fontSize: '18px', marginBottom: '20px' }}>Outreach, Investigations & Notifications</h2>
                    <div className="oc-outreach-grid-2x2">
                        <div className="oc-outreach-stat-card bg-blue-50">
                            <div className="oc-stat-icon"><Search size={20} color="#689EC2" /></div>
                            <div className="oc-stat-val">16</div>
                            <div className="oc-stat-label">Public reports published</div>
                            <div className="oc-stat-desc">AI flagged 3 investigations as high-risk based on anomaly severity.</div>
                        </div>
                        <div className="oc-outreach-stat-card bg-blue-50">
                            <div className="oc-stat-icon"><TrendingUp size={20} color="#689EC2" /></div>
                            <div className="oc-stat-val">11</div>
                            <div className="oc-stat-label">Field Investigations Triggered</div>
                            <div className="oc-stat-desc">AI flagged 3 investigations as high-risk based on anomaly severity.</div>
                        </div>
                        <div className="oc-outreach-stat-card bg-blue-50">
                            <div className="oc-stat-icon"><CheckCircle size={20} color="#689EC2" /></div>
                            <div className="oc-stat-val">62K</div>
                            <div className="oc-stat-label">Customers Notified</div>
                            <div className="oc-stat-desc">AI prioritized notifications to vulnerable zones first.</div>
                        </div>
                        <div className="oc-outreach-stat-card bg-blue-50">
                            <div className="oc-stat-icon"><Droplet size={20} color="#689EC2" /></div>
                            <div className="oc-stat-val">36</div>
                            <div className="oc-stat-label">Lab Alerts Issued</div>
                            <div className="oc-stat-desc">AI reduced false positives by 18% using historical calibration.</div>
                        </div>
                    </div>

                    <div className="oc-ai-footer-insight">
                        <div className="oc-ai-brain-icon">
                            <div className="brain-dot"></div>
                        </div>
                        <span><strong>AI-Powered Insights:</strong> AI-driven strategy reduced investigation response time by <strong>27%</strong> and ensured at-risk customers were notified first.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Dot component for Recharts custom label
const Dot = (props) => {
    const { cx, cy, fill, r } = props;
    return <circle cx={cx} cy={cy} r={r} fill={fill} />;
};

export default OperationsCompliance;
