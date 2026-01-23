import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, ReferenceLine
} from 'recharts';
import {
    Search, TrendingUp, AlertCircle, CheckCircle, Flag, Lightbulb
} from 'lucide-react';
import './FinancialHealth.css';

const API_BASE_URL = 'http://localhost:8084';

// Helper function to format month names
const formatMonth = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
        // Handle period format like "2022-01" (YYYY-MM)
        if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}$/)) {
            const [year, month] = dateStr.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return date.toLocaleDateString('en-US', { month: 'short' });
        }
        // Handle standard date strings
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', dateStr);
            return 'Unknown';
        }
        return date.toLocaleDateString('en-US', { month: 'short' });
    } catch (err) {
        console.warn('Error formatting date:', dateStr, err);
        return 'Unknown';
    }
};

// Helper function to format currency
const formatCurrency = (value) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}M`;
    return `$${value.toFixed(2)}`;
};

const FinancialHealth = () => {
    const [rateIncrease, setRateIncrease] = useState(63);
    const [waterLoss, setWaterLoss] = useState(1);
    const [expenseGrowth, setExpenseGrowth] = useState(5);
    
    // Data states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [revenueTrends, setRevenueTrends] = useState([]);
    const [budgetVariance, setBudgetVariance] = useState([]);
    const [arAging, setArAging] = useState([]);
    const [debtData, setDebtData] = useState([]);
    const [operationalMargins, setOperationalMargins] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [revenueSummary, setRevenueSummary] = useState(null);
    const [scenarios, setScenarios] = useState([]);
    
    // AI Chatbot states
    const [aiQuestion, setAiQuestion] = useState('Provide a summary of the FY24 revenue performance compared to the budget.');
    const [aiResponse, setAiResponse] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    
    // Health check states
    const [backendHealth, setBackendHealth] = useState(null);
    const [aiHealth, setAiHealth] = useState(null);

    // Helper function to handle API responses with success/data wrapper
    const handleApiResponse = async (response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        if (!json.success) {
            throw new Error(json.error || 'API request failed');
        }
        return json.data;
    };

    // Fetch AI response
    const fetchAIResponse = async (question) => {
        try {
            setAiLoading(true);
            setAiError(null);
            setAiResponse(null);
            
            console.log('Sending AI request:', question);
            console.log('API URL:', `${API_BASE_URL}/api/v0/ai/generate-sql`);
            
            // Step 1: Generate SQL from natural language
            const generateResponse = await fetch(`${API_BASE_URL}/api/v0/ai/generate-sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question
                })
            });

            console.log('Generate SQL response status:', generateResponse.status);
            console.log('Generate SQL response ok:', generateResponse.ok);

            if (!generateResponse.ok) {
                const errorText = await generateResponse.text();
                console.error('Response error:', errorText);
                throw new Error(`HTTP error! status: ${generateResponse.status}. ${errorText}`);
            }
            
            const generateJson = await generateResponse.json();
            console.log('Generate SQL response JSON:', generateJson);
            
            // Handle response format: {"sql": "...", "success": true, "type": "sql"}
            // SQL is at top level, not nested in data
            const sql = generateJson.sql || (generateJson.success && generateJson.data?.sql) || generateJson.query;
            const responseType = generateJson.type || generateJson.data?.type;
            
            // If type is "text" or SQL contains an error message, treat as text response
            const isTextResponse = responseType === 'text' || 
                                 (sql && (sql.includes('not allowed') || 
                                         sql.includes('error') || 
                                         sql.includes('Error') ||
                                         sql.includes('LLM') && sql.includes('database')));
            
            // If it's a text response, just show the message and skip SQL execution
            if (isTextResponse && sql) {
                setAiResponse({
                    success: true,
                    sql: null,
                    data: null,
                    summary: sql,
                    isConversational: true
                });
                console.log('AI response set successfully (text response)');
                return;
            }
            
            let sqlResults = null;
            
            // Step 2: If SQL exists and is valid, run it first
            if (sql && !isTextResponse) {
                try {
                    console.log('Running SQL query:', sql);
                    const runResponse = await fetch(`${API_BASE_URL}/api/v0/ai/run-sql`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sql: sql
                        })
                    });

                    if (runResponse.ok) {
                        const runJson = await runResponse.json();
                        sqlResults = runJson.success ? runJson.data : runJson;
                        console.log('SQL execution successful, results:', sqlResults);
                    } else {
                        // SQL generation succeeded but execution failed
                        const errorText = await runResponse.text();
                        console.warn('SQL execution failed:', errorText);
                        // Continue to summary even if SQL execution failed
                    }
                } catch (runErr) {
                    console.warn('SQL execution error:', runErr);
                    // Continue to summary even if SQL execution failed
                }
            }
            
            // Step 3: Generate summary (works with or without SQL results)
            try {
                console.log('Generating summary...');
                const summaryPayload = {
                    question: question
                };
                
                // Include SQL and results if available
                if (sql) {
                    summaryPayload.sql = sql;
                }
                if (sqlResults) {
                    summaryPayload.results = sqlResults;
                }
                
                const summaryResponse = await fetch(`${API_BASE_URL}/api/v0/vanna/generate_summary`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(summaryPayload)
                });

                if (summaryResponse.ok) {
                    const summaryJson = await summaryResponse.json();
                    const summary = summaryJson.summary || summaryJson.text || summaryJson.data?.summary || summaryJson.data;
                    
                    setAiResponse({
                        success: true,
                        sql: sql || null,
                        data: sqlResults,
                        summary: summary || 'Summary generated successfully.'
                    });
                } else {
                    // Summary generation failed, but we can still show SQL/results
                    const errorText = await summaryResponse.text();
                    console.warn('Summary generation failed:', errorText);
                    setAiResponse({
                        success: true,
                        sql: sql || null,
                        data: sqlResults,
                        summary: sqlResults 
                            ? `Query executed successfully. ${Array.isArray(sqlResults) ? sqlResults.length : Object.keys(sqlResults || {}).length} rows returned.`
                            : (sql ? `SQL generated: ${sql}` : 'Question processed successfully.')
                    });
                }
            } catch (summaryErr) {
                console.warn('Summary generation error:', summaryErr);
                // Fallback: show SQL/results even if summary fails
                setAiResponse({
                    success: true,
                    sql: sql || null,
                    data: sqlResults,
                    summary: sqlResults 
                        ? `Query executed successfully. ${Array.isArray(sqlResults) ? sqlResults.length : Object.keys(sqlResults || {}).length} rows returned.`
                        : (sql ? `SQL generated: ${sql}` : 'Question processed successfully.')
                });
            }
            
            console.log('AI response set successfully');
        } catch (err) {
            console.error('Error fetching AI response:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            setAiError(err.message || 'Failed to get AI response. Make sure the backend API is running and the AI service is configured.');
            setAiResponse(null);
        } finally {
            setAiLoading(false);
        }
    };

    // Health check functions
    const checkBackendHealth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            setBackendHealth(data.status === 'healthy' ? 'healthy' : 'unhealthy');
            return data.status === 'healthy';
        } catch (err) {
            console.warn('Backend health check failed:', err);
            setBackendHealth('unreachable');
            return false;
        }
    };

    const checkAIHealth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v0/ai/health`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            // AI health endpoint returns status at top level, not in data wrapper
            const status = json.status || (json.success && json.data?.status) || 'unhealthy';
            setAiHealth(status === 'healthy' ? 'healthy' : 'unhealthy');
            return status === 'healthy';
        } catch (err) {
            console.warn('AI health check failed:', err);
            setAiHealth('unreachable');
            return false;
        }
    };

    // Fetch all data on component mount
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check backend health first
                const backendOk = await checkBackendHealth();
                if (!backendOk) {
                    setError('Backend API is not reachable. Please ensure the server is running at ' + API_BASE_URL);
                    setLoading(false);
                    return;
                }

                // Check AI health
                await checkAIHealth();

                // Fetch KPIs
                const kpisResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/kpis`);
                const kpisData = await handleApiResponse(kpisResponse);
                setKpis(kpisData);

                // Fetch Revenue Trends (last 6 months)
                try {
                    const revenueResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/revenue/trends?period=monthly`);
                    const revenueData = await handleApiResponse(revenueResponse);
                    console.log('Revenue trends API response:', revenueData);
                    
                    if (revenueData && Array.isArray(revenueData) && revenueData.length > 0) {
                        const formattedRevenue = revenueData.slice(-6).map(item => {
                            // Validate data structure
                            if (!item || typeof item !== 'object') {
                                console.warn('Invalid revenue item:', item);
                                return null;
                            }
                            // Backend returns: actual_revenue, budgeted_revenue, revenue_variance, period
                            const actualRevenue = Number(item.actual_revenue || item.revenue || item.actual || 0);
                            const budgetedRevenue = Number(item.budgeted_revenue || item.budgeted || item.budget || 0);
                            
                            return {
                                month: formatMonth(item.period || item.month || item.date),
                                actual: actualRevenue,
                                projected: actualRevenue * 1.1, // Estimate projection (10% growth)
                                budget: budgetedRevenue
                            };
                        }).filter(item => item !== null); // Remove invalid items
                        
                        if (formattedRevenue.length > 0) {
                            console.log('Formatted revenue trends:', formattedRevenue);
                            setRevenueTrends(formattedRevenue);
                        } else {
                            console.warn('No valid revenue data after formatting, using fallback');
                            setRevenueTrends([]); // Will trigger fallback in chart
                        }
                    } else {
                        console.warn('Revenue trends API returned empty or invalid data, using fallback');
                        setRevenueTrends([]); // Will trigger fallback in chart
                    }
                } catch (err) {
                    console.error('Failed to fetch revenue trends:', err);
                    setRevenueTrends([]); // Will trigger fallback in chart
                }

                // Fetch Budget Variance
                try {
                    const budgetResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/budget-variance`);
                    const budgetData = await handleApiResponse(budgetResponse);
                    setBudgetVariance(budgetData || []);
                } catch (err) {
                    console.warn('Failed to fetch budget variance:', err);
                }

                // Fetch AR Aging
                try {
                    const arResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/ar-aging`);
                    const arData = await handleApiResponse(arResponse);
                    setArAging(arData?.aging_breakdown || []);
                } catch (err) {
                    console.warn('Failed to fetch AR aging:', err);
                }

                // Fetch Scenarios
                try {
                    const scenariosResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/scenarios`);
                    const scenariosData = await handleApiResponse(scenariosResponse);
                    setScenarios(Array.isArray(scenariosData) ? scenariosData : []);
                } catch (err) {
                    console.warn('Failed to fetch scenarios:', err);
                }

                // Fetch Debt Data
                try {
                    const debtResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/debt`);
                    const debtData = await handleApiResponse(debtResponse);
                    // Transform debt data for DSCR chart
                    const dscrData = [
                        { 
                            year: '2023', 
                            actual: debtData?.actual_coverage || 1.45, 
                            required: debtData?.required_minimum || 1.30, 
                            forecasted: null 
                        },
                        { 
                            year: '2024', 
                            actual: debtData?.debt_service_coverage || 1.57, 
                            required: debtData?.required_minimum || 1.30, 
                            forecasted: debtData?.projected_coverage || 1.57 
                        },
                        { 
                            year: '2025 (pro)', 
                            actual: null, 
                            required: debtData?.required_minimum || 1.30, 
                            forecasted: (debtData?.projected_coverage || 1.57) * 1.07 
                        }
                    ];
                    setDebtData(dscrData);
                } catch (err) {
                    console.warn('Failed to fetch debt data:', err);
                }

                // Fetch Alerts
                try {
                    const alertsResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/alerts?limit=4`);
                    const alertsData = await handleApiResponse(alertsResponse);
                    setAlerts(Array.isArray(alertsData) ? alertsData : []);
                } catch (err) {
                    console.warn('Failed to fetch alerts:', err);
                }

                // Fetch Revenue Summary
                try {
                    const summaryResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/revenue/summary`);
                    const summaryData = await handleApiResponse(summaryResponse);
                    setRevenueSummary(summaryData);
                } catch (err) {
                    console.warn('Failed to fetch revenue summary:', err);
                }

                // Don't fetch initial AI response automatically - let user submit first
                // fetchAIResponse(aiQuestion);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Handle AI question submission
    const handleAIQuestionSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Form submitted!', { aiQuestion, trimmed: aiQuestion.trim() });
        
        if (aiQuestion.trim()) {
            console.log('Calling fetchAIResponse with:', aiQuestion);
            fetchAIResponse(aiQuestion);
        } else {
            console.warn('Question is empty, not submitting');
            setAiError('Please enter a question');
        }
    };

    // Transform budget variance data for chart
    const budgetVarianceChartData = budgetVariance.length > 0 ? budgetVariance.map(dept => ({
        category: dept.department || dept.name || 'Unknown',
        actual: dept.actual || 0,
        budget: dept.budget || 0,
        flag: Math.abs(dept.variance_pct || 0) > 0.2, // Flag if variance > 20%
        flagText: Math.abs(dept.variance_pct || 0) > 0.2 
            ? (dept.variance_pct > 0 ? 'AI Flag - variance exceeds historical range' : 'AI Flag - sustained overspend detected')
            : ''
    })) : [
        { category: 'Personnel', actual: 850, budget: 800 },
        { category: 'Operations', actual: 1100, budget: 800, flag: true, flagText: 'AI Flag - variance exceeds historical range' },
        { category: 'Infrastructure', actual: 650, budget: 500, flag: true, flagText: 'AI Flag - sustained overspend detected' },
        { category: 'Maintenance', actual: 700, budget: 550 },
        { category: 'Utilities', actual: 450, budget: 400 },
    ];

    // Transform AR Aging data
    const arAgingData = arAging.length > 0 ? arAging.map(item => {
        const bucket = item.bucket?.toLowerCase() || 'current';
        // Match API bucket format: "current", "30_days", "60_days"
        let bucketLabel = 'Current';
        let color = '#16A34A';
        
        if (bucket === 'current') {
            bucketLabel = 'Current';
            color = '#16A34A';
        } else if (bucket === '30_days' || bucket.includes('30')) {
            bucketLabel = '30 Days';
            color = '#FD9C46';
        } else if (bucket === '60_days' || bucket.includes('60')) {
            bucketLabel = '60+ Days';
            color = '#DC2626';
        }
        
        return {
            label: `${bucketLabel} (${formatCurrency((item.amount || 0) * 10)})`,
            percent: Math.round((item.percentage || 0) * 100),
            color: color
        };
    }) : [
        { label: 'Current ($1.2M)', percent: 47, color: '#16A34A' },
        { label: '30 Days ($450K)', percent: 23, color: '#FD9C46' },
        { label: '60+ Days ($280K)', percent: 12, color: '#DC2626' },
    ];

    if (loading) {
        return (
            <div className="financial-health-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Loading financial data...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="financial-health-container">
                <div style={{ textAlign: 'center', padding: '50px', color: '#DC2626' }}>
                    <h2>Error loading data</h2>
                    <p>{error}</p>
                    <p style={{ fontSize: '12px', marginTop: '10px' }}>Make sure the backend API is running at {API_BASE_URL}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="financial-health-container">
            {/* Header */}
            <div className="fh-page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h1 className="fh-brand-title">AquaSentinel™</h1>
                        <p className="fh-brand-subtitle">CFO Command Intelligence for Financial, Operational, Billing & Compliance Oversight</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {backendHealth && (
                            <div style={{ 
                                fontSize: '10px', 
                                padding: '4px 8px', 
                                borderRadius: '12px',
                                background: backendHealth === 'healthy' ? '#D1FAE5' : '#FEE2E2',
                                color: backendHealth === 'healthy' ? '#065F46' : '#991B1B'
                            }}>
                                Backend: {backendHealth === 'healthy' ? '✓ Online' : backendHealth === 'unreachable' ? '✗ Offline' : '⚠ Unhealthy'}
                            </div>
                        )}
                        {aiHealth && (
                            <div style={{ 
                                fontSize: '10px', 
                                padding: '4px 8px', 
                                borderRadius: '12px',
                                background: aiHealth === 'healthy' ? '#D1FAE5' : '#FEE2E2',
                                color: aiHealth === 'healthy' ? '#065F46' : '#991B1B'
                            }}>
                                AI: {aiHealth === 'healthy' ? '✓ Ready' : aiHealth === 'unreachable' ? '✗ Offline' : '⚠ Unhealthy'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="fh-tab-navigation">
                <button className="fh-tab active">Financial Health</button>
                <button className="fh-tab">Operations & Compliance</button>
                <button className="fh-tab">Billing Insights</button>
            </div>

            {/* KPI Cards - Row 1 */}
            <div className="fh-kpi-grid-row1">
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Operating Margin</div>
                    <div className="fh-kpi-value">{((kpis?.operating_margin || 0.184) * 100).toFixed(1)}%</div>
                    <div className="fh-kpi-change positive">▲ +2.3%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Days Sales Outstanding</div>
                    <div className="fh-kpi-value">{kpis?.days_sales_outstanding || 38}</div>
                    <div className="fh-kpi-change negative">▼ -3.2%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Non Revenue Water %</div>
                    <div className="fh-kpi-value">{((kpis?.non_revenue_water_pct || 0.231) * 100).toFixed(1)}%</div>
                    <div className="fh-kpi-change negative">▼ -1.8%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Cost per Gallon</div>
                    <div className="fh-kpi-value">${kpis?.cost_per_gallon?.toFixed(2) || '4.27'}</div>
                    <div className="fh-kpi-change positive">▲ +4.27%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Collection Rate</div>
                    <div className="fh-kpi-value">{((kpis?.collection_rate || 0.942) * 100).toFixed(2)}%</div>
                    <div className="fh-kpi-change positive">▲ +2.1%</div>
                </div>
            </div>

            {/* KPI Cards - Row 2 */}
            <div className="fh-kpi-grid-row2">
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Annual Revenue</div>
                    <div className="fh-kpi-value">{formatCurrency((kpis?.total_revenue || 26.5) * 10)}</div>
                    <div className="fh-kpi-change positive">▲ +3.2% vs last year</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Water Revenue</div>
                    <div className="fh-kpi-value">{formatCurrency((kpis?.water_revenue || 47.2) * 10)}</div>
                    <div className="fh-kpi-change positive">▲ +2.1%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Cash Reserve</div>
                    <div className="fh-kpi-value">{formatCurrency((kpis?.cash_reserve || 4.2) * 10)}</div>
                    <div className="fh-kpi-change positive">▲ +12% from last quarter</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Debt Service Coverage</div>
                    <div className="fh-kpi-value">{kpis?.debt_service_coverage?.toFixed(1) || '2.9'}x</div>
                    <div className="fh-kpi-change positive">▲ +8.2%</div>
                </div>
            </div>

            {/* AI Query Section */}
            <div className="fh-ai-query-section">
                <div className="fh-ai-search-bar">
                    <form onSubmit={handleAIQuestionSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                        <Search size={18} className="fh-search-icon" />
                        <input
                            type="text"
                            className="fh-ai-search-input"
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            placeholder="Ask a question about your financial data..."
                            disabled={aiLoading}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !aiLoading && aiQuestion.trim()) {
                                    e.preventDefault();
                                    handleAIQuestionSubmit(e);
                                }
                            }}
                        />
                        <button 
                            type="submit" 
                            disabled={aiLoading || !aiQuestion.trim()}
                            style={{ 
                                background: aiLoading ? '#E5E7EB' : '#1B5B7E', 
                                border: 'none', 
                                cursor: aiLoading || !aiQuestion.trim() ? 'not-allowed' : 'pointer',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                color: aiLoading ? '#9CA3AF' : '#FFFFFF',
                                fontWeight: '600',
                                fontSize: '14px',
                                minWidth: '60px',
                                flexShrink: 0
                            }}
                            title={!aiQuestion.trim() ? 'Enter a question first' : 'Submit question'}
                        >
                            {aiLoading ? '...' : 'Ask'}
                        </button>
                    </form>
                </div>
                <div className="fh-ai-response-box">
                    {aiLoading && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#1B5B7E' }}>
                            <p>Analyzing your question...</p>
                        </div>
                    )}
                    {aiError && (
                        <div style={{ 
                            color: '#DC2626', 
                            padding: '15px', 
                            background: '#FEE2E2',
                            borderRadius: '5px',
                            marginBottom: '10px'
                        }}>
                            <strong>Error:</strong> {aiError}
                            <div style={{ fontSize: '12px', marginTop: '8px', color: '#991B1B' }}>
                                <p>💡 Troubleshooting:</p>
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Make sure the backend API is running at {API_BASE_URL}</li>
                                    <li>Check that the AI service is configured (OpenAI API key, etc.)</li>
                                    <li>Verify the endpoint: {API_BASE_URL}/api/v0/ai/generate-sql</li>
                                    <li>Check browser console for detailed error messages</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    {aiResponse && !aiLoading && (
                        <div>
                            {/* Conversational response (not SQL) */}
                            {aiResponse.isConversational && (
                                <div>
                                    <h3>AI Response:</h3>
                                    <div style={{ 
                                        whiteSpace: 'pre-wrap', 
                                        lineHeight: '1.6',
                                        marginBottom: '15px',
                                        padding: '15px',
                                        background: '#F0F9FF',
                                        borderRadius: '5px',
                                        border: '1px solid #BAE6FD'
                                    }}>
                                        {aiResponse.sql || aiResponse.summary || aiResponse.error}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                                        💡 Try asking a specific question about your data, like "What was the total revenue in 2024?" or "Show me budget variance by department"
                                    </p>
                                </div>
                            )}
                            
                            {/* Response with error but has SQL */}
                            {aiResponse.hasError && !aiResponse.isConversational && (
                                <div>
                                    <h3>Query Generated:</h3>
                                    <div style={{ 
                                        padding: '10px',
                                        background: '#FEF3C7',
                                        borderRadius: '5px',
                                        marginBottom: '15px',
                                        border: '1px solid #FCD34D'
                                    }}>
                                        <strong>⚠️ Note:</strong> {aiResponse.summary || aiResponse.error}
                                    </div>
                                    {aiResponse.sql && (
                                        <details open style={{ marginTop: '10px' }}>
                                            <summary style={{ cursor: 'pointer', color: '#689EC2', fontWeight: '600' }}>
                                                🔍 Generated SQL Query
                                            </summary>
                                            <pre style={{ 
                                                background: '#f5f5f5', 
                                                padding: '10px', 
                                                borderRadius: '5px',
                                                fontSize: '11px',
                                                marginTop: '5px',
                                                overflow: 'auto'
                                            }}>
                                                {aiResponse.sql}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                            
                            {/* Successful SQL response with summary */}
                            {aiResponse.summary && !aiResponse.isConversational && !aiResponse.hasError && (
                                <div>
                                    <h3>AI Analysis:</h3>
                                    <div style={{ 
                                        whiteSpace: 'pre-wrap', 
                                        lineHeight: '1.6',
                                        marginBottom: '15px'
                                    }}>
                                        {aiResponse.summary}
                                    </div>
                                    {aiResponse.data && Array.isArray(aiResponse.data) && aiResponse.data.length > 0 && (
                                        <div style={{ marginTop: '15px' }}>
                                            <h4>Query Results ({aiResponse.row_count || aiResponse.data.length} row{aiResponse.data.length !== 1 ? 's' : ''}):</h4>
                                            <div style={{ 
                                                background: '#f5f5f5', 
                                                padding: '10px', 
                                                borderRadius: '5px',
                                                fontSize: '12px',
                                                overflow: 'auto',
                                                maxHeight: '300px'
                                            }}>
                                                <pre style={{ margin: 0 }}>
                                                    {JSON.stringify(aiResponse.data, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                    {aiResponse.sql && aiResponse.type === 'sql' && (
                                        <details style={{ marginTop: '10px' }}>
                                            <summary style={{ cursor: 'pointer', color: '#689EC2', fontWeight: '600' }}>
                                                🔍 View Generated SQL Query
                                            </summary>
                                            <pre style={{ 
                                                background: '#f5f5f5', 
                                                padding: '10px', 
                                                borderRadius: '5px',
                                                fontSize: '11px',
                                                marginTop: '5px',
                                                overflow: 'auto'
                                            }}>
                                                {aiResponse.sql}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                            
                            {/* Response with data but no summary */}
                            {!aiResponse.summary && !aiResponse.isConversational && aiResponse.data && Array.isArray(aiResponse.data) && aiResponse.data.length > 0 && (
                                <div>
                                    <h3>Query Results:</h3>
                                    <p>Found {aiResponse.row_count || aiResponse.data.length} result(s)</p>
                                    <div style={{ 
                                        background: '#f5f5f5', 
                                        padding: '10px', 
                                        borderRadius: '5px',
                                        fontSize: '12px',
                                        overflow: 'auto',
                                        maxHeight: '300px',
                                        marginTop: '10px'
                                    }}>
                                        <pre style={{ margin: 0 }}>
                                            {JSON.stringify(aiResponse.data, null, 2)}
                                        </pre>
                                    </div>
                                    {aiResponse.sql && (
                                        <details style={{ marginTop: '10px' }}>
                                            <summary style={{ cursor: 'pointer', color: '#689EC2', fontWeight: '600' }}>
                                                🔍 View SQL Query
                                            </summary>
                                            <pre style={{ 
                                                background: '#f5f5f5', 
                                                padding: '10px', 
                                                borderRadius: '5px',
                                                fontSize: '11px',
                                                marginTop: '5px'
                                            }}>
                                                {aiResponse.sql}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                            
                            {/* No data found */}
                            {!aiResponse.summary && !aiResponse.isConversational && !aiResponse.hasError && (!aiResponse.data || (Array.isArray(aiResponse.data) && aiResponse.data.length === 0)) && (
                                <div>
                                    <h3>AI Response:</h3>
                                    <p>No data found for your query.</p>
                                    {aiResponse.sql && (
                                        <details style={{ marginTop: '10px' }}>
                                            <summary style={{ cursor: 'pointer', color: '#689EC2', fontWeight: '600' }}>
                                                🔍 View SQL Query
                                            </summary>
                                            <pre style={{ 
                                                background: '#f5f5f5', 
                                                padding: '10px', 
                                                borderRadius: '5px',
                                                fontSize: '11px',
                                                marginTop: '5px'
                                            }}>
                                                {aiResponse.sql}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {!aiResponse && !aiLoading && !aiError && (
                        <div>
                            <h3>1. Revenue Performance Overview:</h3>
                            <p>
                                Actual Revenue: <strong>{formatCurrency((revenueSummary?.total_revenue || kpis?.total_revenue || 26.5) * 10)}</strong>, 
                                Budgeted Revenue: <strong>{formatCurrency((revenueSummary?.budgeted_revenue || kpis?.budgeted_revenue || 22.4) * 10)}</strong>, 
                                Revenue Variance: <strong>{revenueSummary?.variance_pct ? (revenueSummary.variance_pct > 0 ? '+' : '') + (revenueSummary.variance_pct * 100).toFixed(1) + '%' : '+18.4%'}</strong> 
                                {revenueSummary?.variance && (
                                    <> ({(revenueSummary.variance > 0 ? 'Positive' : 'Negative')} variance of <strong>{formatCurrency(Math.abs(revenueSummary.variance) * 10)}</strong>)</>
                                )}
                            </p>
                            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '15px', padding: '10px', background: '#F3F4F6', borderRadius: '5px' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>💡 Try asking questions like:</p>
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>"What was the total revenue in 2024?"</li>
                                    <li>"Show me revenue by quarter"</li>
                                    <li>"Which departments had the highest budget variance?"</li>
                                    <li>"What is the average operating margin?"</li>
                                    <li>"Show me months with non-revenue water above 25%"</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Title */}
            <div className="fh-section-header">
                <h2 className="fh-section-title">
                    <span className="fh-title-icon">📊</span>
                    Financial Performance & Strategy Hub
                </h2>
            </div>

            {/* Main Grid - Combined for proper spanning */}
            <div className="fh-performance-grid">
                {/* Chart 1: Actual Revenue vs Budget Revenue */}
                <div className="fh-chart-card">
                    <div className="fh-chart-header">
                        <div className="fh-chart-title">Actual Revenue vs Budget Revenue</div>
                        <div className="fh-chart-legend">
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#689EC2' }}></span>
                                Actual Revenue
                            </span>
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#FD9C46' }}></span>
                                Projected Revenue
                            </span>
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#1B5B7E' }}></span>
                                Budget
                            </span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={
                            (revenueTrends.length > 0 && revenueTrends.every(item => 
                                item && item.month && typeof item.actual === 'number' && !isNaN(item.actual)
                            )) ? revenueTrends : [
                            { month: 'Jan', actual: 2.20, projected: 2.45, budget: 2.20 },
                            { month: 'Feb', actual: 2.23, projected: 2.40, budget: 2.20 },
                            { month: 'Mar', actual: 2.26, projected: 2.38, budget: 2.20 },
                            { month: 'Apr', actual: 2.30, projected: 2.42, budget: 2.20 },
                            { month: 'May', actual: 2.40, projected: 2.48, budget: 2.20 },
                            { month: 'Jun', actual: 2.58, projected: 2.52, budget: 2.20 },
                        ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" fontSize={11} stroke="#6B7280" />
                            <YAxis fontSize={11} stroke="#6B7280" />
                            <Tooltip />
                            <Line type="monotone" dataKey="actual" stroke="#689EC2" strokeWidth={2} dot={{ r: 3, fill: '#689EC2' }} />
                            <Line type="monotone" dataKey="projected" stroke="#FD9C46" strokeWidth={2} dot={{ r: 3, fill: '#FD9C46' }} />
                            <Line type="monotone" dataKey="budget" stroke="#1B5B7E" strokeWidth={2} dot={{ r: 3, fill: '#1B5B7E' }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="fh-chart-y-label">Revenue ($)</div>
                </div>

                {/* Chart 2: Budget Variance Analysis */}
                <div className="fh-chart-card fh-budget-variance-card">
                    <div className="fh-budget-variance-header">
                        <div className="fh-budget-variance-title">Budget Variance Analysis</div>
                        <div className="fh-budget-variance-subtitle">AI-identified drivers, risk areas, and forward outlook</div>
                    </div>
                    <div className="fh-ai-confidence-badge">
                        <span className="fh-confidence-label">AI Confidence:</span>
                        <span className="fh-confidence-value">High</span>
                    </div>
                    <div className="fh-budget-variance-legend">
                        <div className="fh-legend-item-budget">
                            <span className="fh-legend-dot-actual"></span>
                            <span className="fh-legend-text">Actual Revenue</span>
                        </div>
                        <div className="fh-legend-item-budget">
                            <span className="fh-legend-dot-budget"></span>
                            <span className="fh-legend-text">Budget</span>
                        </div>
                    </div>
                    <div className="fh-budget-variance-chart-container">
                        <ResponsiveContainer width="100%" height={171}>
                            <BarChart
                                data={budgetVarianceChartData}
                                layout="vertical"
                                margin={{ top: 10, right: 20, left: 60, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
                                <XAxis 
                                    type="number" 
                                    domain={[0, 1250]} 
                                    ticks={[0, 250, 500, 750, 1000, 1250]}
                                    tickFormatter={(value) => {
                                        if (value === 0) return '0';
                                        if (value === 250) return '250k';
                                        if (value === 500) return '500k';
                                        if (value === 750) return '750k';
                                        if (value === 1000) return '1000k';
                                        if (value === 1250) return '1250k';
                                        return '';
                                    }} 
                                    fontSize={10.6179} 
                                    stroke="#6B7280"
                                    tick={{ fill: '#6B7280' }}
                                />
                                <YAxis 
                                    dataKey="category" 
                                    type="category" 
                                    fontSize={8.78802} 
                                    stroke="#6B7280" 
                                    width={60}
                                    tick={{ fill: '#6B7280' }}
                                />
                                <Tooltip />
                                <Bar dataKey="budget" fill="#1B5B7E" barSize={10} radius={0} />
                                <Bar dataKey="actual" fill="#689EC2" barSize={10} radius={0} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="fh-budget-variance-flags">
                            {budgetVarianceChartData.filter(item => item.flag).map((item, idx) => (
                                <div key={idx} className={idx === 0 ? 'fh-variance-flag-operations' : 'fh-variance-flag-infrastructure'}>
                                    <Flag size={10} />
                                    <span>{item.flagText || 'AI Flag - variance exceeds historical range'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="fh-ai-summary-box">
                        <p><strong>AI Summary:</strong> Operations and Infrastructure account for 68% of total budget variance; Personnel costs are trending forecast.</p>
                        <p><strong>AI Outlook:</strong> If current trends continue, Operations variance is expected to widen by -12% next quarter.</p>
                    </div>
                </div>

                {/* Scenario Planning Panel - Spans 2 rows */}
                <div className="fh-scenario-panel fh-span-2-rows">
                    <div className="fh-scenario-header">
                        <div className="fh-scenario-title">Scenario Planning</div>
                        <div className="fh-scenario-tabs">
                            <button className="fh-scenario-tab active">Manual</button>
                            <button className="fh-scenario-tab">Presets</button>
                        </div>
                    </div>

                    <div className="fh-scenario-input">
                        <div className="fh-input-label-row">
                            <span>Rate Increase</span>
                            <span className="fh-input-value">{rateIncrease}.00%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={rateIncrease}
                            onChange={(e) => setRateIncrease(e.target.value)}
                            className="fh-slider"
                        />
                        <div className="fh-impact-text positive">Revenue impact: +$0.50M</div>
                    </div>

                    <div className="fh-scenario-input">
                        <div className="fh-input-label-row">
                            <span>Water Loss Reduction</span>
                            <span className="fh-input-value">{waterLoss}.00%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={waterLoss}
                            onChange={(e) => setWaterLoss(e.target.value)}
                            className="fh-slider"
                        />
                        <div className="fh-impact-text positive">Revenue impact: +$0.01M</div>
                    </div>

                    <div className="fh-scenario-input">
                        <div className="fh-input-label-row">
                            <span>Rate Increase</span>
                            <span className="fh-input-value">{expenseGrowth}.00%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={expenseGrowth}
                            onChange={(e) => setExpenseGrowth(e.target.value)}
                            className="fh-slider"
                        />
                        <div className="fh-impact-text negative">Expense impact: +$0.08M</div>
                    </div>

                    <div className="fh-scenario-input">
                        <input type="text" className="fh-scenario-name-input" placeholder="Scenario Name" />
                        <button className="fh-save-btn">Save</button>
                    </div>

                    <div className="fh-scenario-impact-box">
                        <div className="fh-impact-header">SCENARIO IMPACT</div>
                        {scenarios.length > 0 ? (
                            // Use latest scenario data (most recent date)
                            (() => {
                                const latestScenario = scenarios.sort((a, b) => 
                                    new Date(b.date) - new Date(a.date)
                                )[0] || scenarios[0];
                                return (
                                    <>
                                        <div className="fh-impact-row">
                                            <span>Projected Revenue</span>
                                            <span className={latestScenario.projected_revenue > 0 ? 'fh-impact-positive' : 'fh-impact-negative'}>
                                                {formatCurrency((latestScenario.projected_revenue || 0) * 10)}
                                            </span>
                                        </div>
                                        <div className="fh-impact-row">
                                            <span>Net Income</span>
                                            <span className={latestScenario.net_income > 0 ? 'fh-impact-positive' : 'fh-impact-negative'}>
                                                {formatCurrency((latestScenario.net_income || 0) * 10)}
                                            </span>
                                        </div>
                                        <div className="fh-impact-row">
                                            <span>Debt Service Coverage</span>
                                            <span className={latestScenario.debt_service_coverage > 1.25 ? 'fh-impact-positive' : 'fh-impact-negative'}>
                                                {latestScenario.debt_service_coverage?.toFixed(2) || '0.00'}x
                                            </span>
                                        </div>
                                        <div className="fh-impact-row">
                                            <span>Financial Viability</span>
                                            <span className={latestScenario.financial_viability?.toLowerCase().includes('healthy') ? 'fh-impact-positive' : 'fh-impact-negative'}>
                                                {latestScenario.financial_viability || 'Unknown'}
                                            </span>
                                        </div>
                                    </>
                                );
                            })()
                        ) : (
                            // Fallback to default values
                            <>
                                <div className="fh-impact-row">
                                    <span>Operating Income</span>
                                    <span className="fh-impact-negative">$7.70M</span>
                                </div>
                                <div className="fh-impact-row">
                                    <span>Net Income</span>
                                    <span className="fh-impact-positive">$4.50M</span>
                                </div>
                                <div className="fh-impact-row">
                                    <span>Debt Service Coverage</span>
                                    <span className="fh-impact-positive">11.88x</span>
                                </div>
                                <div className="fh-impact-row">
                                    <span>Financial Viability</span>
                                    <span className="fh-impact-positive">Healthy</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="fh-key-insights-box">
                        <div className="fh-insights-header">KEY INSIGHTS</div>
                        <div className="fh-insight-item">
                            <CheckCircle size={7} color="#16A34A" strokeWidth={1} />
                            <span>Scenario generates positive net income</span>
                        </div>
                        <div className="fh-insight-item">
                            <CheckCircle size={7} color="#16A34A" strokeWidth={1} />
                            <span>Debt service coverage is healthy</span>
                        </div>
                        <div className="fh-insight-item blue">
                            <span>Rate increase exceeds break-even point</span>
                        </div>
                    </div>
                </div>
                {/* Main Grid - Row 2 Content continues here */}
                {/* Operational Margin Chart */}
                <div className="fh-chart-card">
                    <div className="fh-chart-header">
                        <div className="fh-chart-title">Operational Margin & Profitability Trend</div>
                        <div className="fh-chart-legend">
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#689EC2' }}></span>
                                Expense
                            </span>
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#FD9C46' }}></span>
                                Margin
                            </span>
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#1B5B7E' }}></span>
                                Revenue
                            </span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={operationalMargins.length > 0 ? operationalMargins : [
                            { month: 'Jan', expense: 2.75, margin: 0.25, revenue: 4.4 },
                            { month: 'Feb', expense: 2.8, margin: 0.3, revenue: 4.5 },
                            { month: 'Mar', expense: 2.9, margin: 0.25, revenue: 4.4 },
                            { month: 'Apr', expense: 3.0, margin: 0.3, revenue: 4.6 },
                            { month: 'May', expense: 3.1, margin: 0.35, revenue: 4.8 },
                            { month: 'Jun', expense: 3.15, margin: 0.35, revenue: 4.9 },
                        ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" fontSize={11} stroke="#6B7280" />
                            <YAxis fontSize={11} stroke="#6B7280" />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1B5B7E" fill="rgba(27, 91, 126, 0.4)" />
                            <Area type="monotone" dataKey="expense" stackId="2" stroke="#689EC2" fill="rgba(104, 158, 194, 0.4)" />
                            <Area type="monotone" dataKey="margin" stackId="3" stroke="#FD9C46" fill="rgba(253, 156, 70, 0.4)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="fh-chart-y-label">Amount ($)</div>
                </div>

                {/* Accounts Receivable Aging */}
                <div className="fh-chart-card">
                    <div className="fh-chart-header">
                        <div className="fh-chart-title">Accounts Receivable Aging</div>
                        <div className="fh-chart-subtitle">Payment Status Distribution</div>
                    </div>
                    <div className="fh-ar-aging-bars">
                        {arAgingData.map((item, i) => (
                            <div key={i} className="fh-ar-row">
                                <div className="fh-ar-label">{item.label}</div>
                                <div className="fh-ar-percent">{item.percent}.00%</div>
                                <div className="fh-ar-bar-container">
                                    <div className="fh-ar-bar" style={{ width: `${item.percent}%`, background: item.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actionable Intelligence Section */}
            <div className="fh-section-header">
                <h2 className="fh-section-title">
                    <span className="fh-title-icon">📊</span>
                    Actionable Intelligence for Strategic Decisions
                </h2>
            </div>

            <div className="fh-intelligence-grid">
                {[
                    { title: 'Batch Dispute – BlueCross', insight: 'Actual Revenue is exceeding projections.', recommendation: 'Adjust revenue forecasts and consider price increases or service expansion to leverage higher demand.' },
                    { title: 'Expense Analysis', insight: 'Over-budget spending in Personnel and Operations, under-budget in Maintenance and Utilities.', recommendation: 'Reallocate funds to cover personnel and operations while revising budget forecasts for infrastructure.' },
                    { title: 'Margin Compression', insight: 'Growing revenue but rising expenses are compressing margins.', recommendation: 'Optimize costs by focusing on operational efficiencies and cutting non-essential expenditures.' },
                    { title: 'Collections Issue', insight: '23% overdue accounts (30+ days), 12% (60+ days).', recommendation: 'Strengthen collections on overdue accounts, offering payment incentives and more follow-up.' },
                ].map((item, i) => (
                    <div key={i} className="fh-intel-card">
                        <div className="fh-intel-icon">
                            <Lightbulb size={16} color="#FD9C46" />
                        </div>
                        <div className="fh-intel-content">
                            <div className="fh-intel-title">{item.title}</div>
                            <div className="fh-intel-insight"><strong>Insight:</strong> {item.insight}</div>
                            <div className="fh-intel-recommendation"><strong>Recommendation:</strong> {item.recommendation}</div>
                            <button className="fh-intel-btn">Take Action</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Debt Sustainability Section */}
            <div className="fh-section-header">
                <h2 className="fh-section-title">
                    <span className="fh-title-icon">💹</span>
                    Debt Sustainability & Health Outlook
                </h2>
            </div>

            <div className="fh-debt-grid">
                <div className="fh-chart-card fh-dscr-card">
                    <div className="fh-chart-header">
                        <div className="fh-chart-title">Debt Service Coverage Ratio (DSCR) Trend with AI Insights</div>
                        <div className="fh-chart-legend">
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#689EC2' }}></span>
                                Forecasted Coverage (AI)
                            </span>
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#FD9C46' }}></span>
                                Required Minimum
                            </span>
                            <span className="fh-legend-item">
                                <span className="fh-legend-dot" style={{ background: '#1B5B7E' }}></span>
                                Actual Coverage
                            </span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={debtData.length > 0 ? debtData : [
                            { year: '2023', actual: 1.45, required: 1.30, forecasted: null },
                            { year: '2024', actual: 1.57, required: 1.30, forecasted: 1.57 },
                            { year: '2025 (pro)', actual: null, required: 1.30, forecasted: 1.68 }
                        ]} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="year" fontSize={11} stroke="#6B7280" />
                            <YAxis fontSize={11} stroke="#6B7280" domain={[1.2, 1.8]} />
                            <Tooltip />
                            <ReferenceLine y={1.30} stroke="#FD9C46" strokeWidth={2} label={{ value: 'Required Minimum', position: 'right', fontSize: 9 }} />
                            <Line type="monotone" dataKey="actual" stroke="#1B5B7E" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="forecasted" stroke="#689EC2" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="fh-chart-y-label">DSCR (Debt Service Coverage Ratio)</div>
                    <div className="fh-dscr-annotations">
                        <div className="fh-dscr-note" style={{ top: '40px', left: '60px' }}>Risk: No risk</div>
                        <div className="fh-dscr-note" style={{ top: '60px', left: '270px' }}>Risk: Medium risk</div>
                        <div className="fh-dscr-note" style={{ top: '20px', right: '60px' }}>Risk: Low risk</div>
                    </div>
                </div>

                <div className="fh-summary-card">
                    <div className="fh-chart-header">
                        <div className="fh-chart-title">Financial Health Summary</div>
                        <div className="fh-chart-subtitle">Key metrics and scenario-adjusted projections</div>
                    </div>
                    <div className="fh-summary-list">
                        {[
                            { label: '12-Month Projected Revenue', value: formatCurrency((kpis?.total_revenue || 26.5) * 10) },
                            { label: 'Expected Operating Expenses', value: formatCurrency(((kpis?.total_revenue || 26.5) * (1 - (kpis?.operating_margin || 0.184))) * 10) },
                            { label: 'Capital Investment Plan', value: formatCurrency(3.2 * 10) },
                            { label: 'Outstanding Debt', value: formatCurrency((kpis?.outstanding_debt || 8.1) * 10) },
                        ].map((item, i) => (
                            <div key={i} className="fh-summary-row">
                                <span>{item.label}</span>
                                <span className="fh-summary-value">{item.value}</span>
                            </div>
                        ))}
                        <div className="fh-summary-row highlight">
                            <span><strong>Projected Net Income</strong></span>
                            <span className="fh-summary-value positive">
                                <strong>{formatCurrency(((kpis?.total_revenue || 26.5) * (kpis?.operating_margin || 0.184)) * 10)}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Yield & Efficiency Alerts Section */}
            <div className="fh-section-header">
                <h2 className="fh-section-title">
                    <span className="fh-title-icon">🎯</span>
                    Yield & Efficiency Alerts
                </h2>
            </div>

            <div className="fh-alerts-grid">
                {(alerts.length > 0 ? alerts.map(alert => ({
                    title: alert.alert_type || alert.title || 'Alert',
                    text: alert.description || alert.text || '',
                    confidence: Math.round((alert.confidence_level || 0.85) * 100),
                    icon: alert.alert_type?.toLowerCase().includes('leakage') || 
                          alert.alert_type?.toLowerCase().includes('risk') || 
                          alert.alert_type?.toLowerCase().includes('detected') ? 'alert' : 'check'
                })) : [
                    { title: 'Revenue Optimization Opportunity', text: 'Analysis suggests implementing dynamic pricing during peak demand hours could increase quarterly revenue by 2-3%', confidence: 92, icon: 'check' },
                    { title: 'Q1 Profitability Forecast', text: 'Based on current trajectory, Q1 net income expected to reach $19.8M, 3.6% above budget forecast.', confidence: 85, icon: 'check' },
                    { title: 'Revenue Leakage Detected', text: '$285K daily loss from NRW represents 23% efficiency gap vs. industry benchmark of 15%', confidence: 80, icon: 'alert' },
                    { title: 'Cost Optimization Opportunity', text: 'Reducing NRW by 5% could recover $52.2K in daily revenue without operational changes', confidence: 87, icon: 'check' },
                ]).map((item, i) => (
                    <div key={i} className="fh-alert-card">
                        <div className="fh-alert-icon">
                            {item.icon === 'check' ? (
                                <CheckCircle size={18} color="#16A34A" />
                            ) : (
                                <AlertCircle size={18} color="#FD9C46" />
                            )}
                        </div>
                        <div className="fh-alert-content">
                            <div className="fh-alert-title">{item.title}</div>
                            <div className="fh-alert-text">{item.text}</div>
                            <div className="fh-alert-confidence">
                                <span>Confidence Level</span>
                                <span>{item.confidence}%</span>
                            </div>
                            <div className="fh-confidence-bar-container">
                                <div className="fh-confidence-bar" style={{ width: `${item.confidence}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="fh-progress-indicator">
                <div className="fh-progress-bar"></div>
            </div>
        </div>
    );
};

export default FinancialHealth;
