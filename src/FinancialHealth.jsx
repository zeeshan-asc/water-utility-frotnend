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

// Helper function to format number with commas
const formatNumber = (value) => {
    if (typeof value === 'number') {
        return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return value;
};

// Helper function to format table data
const formatTableData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    const columns = Object.keys(data[0]);
    return { columns, rows: data };
};

// Helper function to parse summary into sections
const parseSummary = (summary) => {
    if (!summary) return { question: '', keyStats: [], data: [], other: [] };
    
    const lines = summary.split('\n').filter(line => line.trim());
    const result = {
        question: '',
        keyStats: [],
        data: [],
        other: []
    };
    
    let currentSection = 'other';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect "Based on the question" section
        if (line.toLowerCase().includes('based on the question') || 
            line.toLowerCase().includes('question:')) {
            currentSection = 'question';
            // Extract the question part
            const questionMatch = line.match(/['"](.*?)['"]/);
            if (questionMatch) {
                result.question = questionMatch[1];
            } else {
                result.question = line.replace(/based on the question:?/i, '').trim();
            }
            continue;
        }
        
        // Detect "Key statistics" section
        if (line.toLowerCase().includes('key statistics') || 
            line.toLowerCase().includes('key stats')) {
            currentSection = 'keyStats';
            continue;
        }
        
        // Detect "Data:" section
        if (line.toLowerCase() === 'data:' || 
            line.toLowerCase().startsWith('data:')) {
            currentSection = 'data';
            continue;
        }
        
        // Process content based on current section
        if (currentSection === 'keyStats') {
            if (line.startsWith('-') || line.startsWith('•')) {
                result.keyStats.push(line.replace(/^[-•]\s*/, '').trim());
            } else if (line.includes(':')) {
                result.keyStats.push(line);
            }
        } else if (currentSection === 'data') {
            if (line && !line.toLowerCase().includes('data')) {
                result.data.push(line);
            }
        } else if (currentSection === 'question') {
            // Continue collecting question text
            if (line && !line.toLowerCase().includes('query returned')) {
                const questionMatch = line.match(/['"](.*?)['"]/);
                if (questionMatch && !result.question) {
                    result.question = questionMatch[1];
                }
            }
        } else {
            // Other content
            if (line && !line.toLowerCase().includes('query returned')) {
                result.other.push(line);
            }
        }
    }
    
    return result;
};

const FinancialHealth = () => {
    const [rateIncrease, setRateIncrease] = useState(63);
    const [waterLoss, setWaterLoss] = useState(1);
    const [expenseGrowth, setExpenseGrowth] = useState(5);
    const [scenarioName, setScenarioName] = useState('');

    // Calculate dynamic impacts based on current data
    const calculateRateIncreaseImpact = () => {
        const currentRevenue = (revenueSummary?.total_revenue || kpis?.total_revenue || 26.5) * 10; // Convert to millions
        const impact = (currentRevenue * rateIncrease) / 100;
        return impact;
    };

    const calculateWaterLossImpact = () => {
        const currentRevenue = (revenueSummary?.total_revenue || kpis?.total_revenue || 26.5) * 10;
        const currentWaterLoss = (kpis?.non_revenue_water_pct || 0.231) * 100; // Convert to percentage
        // Water loss reduction impact: if we reduce water loss, we recover that percentage of revenue
        const impact = (currentRevenue * (waterLoss / 100) * (currentWaterLoss / 100));
        return impact;
    };

    const calculateExpenseImpact = () => {
        const currentRevenue = (revenueSummary?.total_revenue || kpis?.total_revenue || 26.5) * 10;
        const operatingMargin = kpis?.operating_margin || 0.184;
        const currentExpenses = currentRevenue * (1 - operatingMargin);
        const impact = (currentExpenses * expenseGrowth) / 100;
        return impact;
    };

    // Calculate total scenario impact
    const calculateScenarioImpact = () => {
        const revenueImpact = calculateRateIncreaseImpact() + calculateWaterLossImpact();
        const expenseImpact = calculateExpenseImpact();
        const currentRevenue = (revenueSummary?.total_revenue || kpis?.total_revenue || 26.5) * 10;
        const operatingMargin = kpis?.operating_margin || 0.184;
        const currentExpenses = currentRevenue * (1 - operatingMargin);
        const currentNetIncome = currentRevenue * operatingMargin;
        
        const projectedRevenue = currentRevenue + revenueImpact;
        const projectedExpenses = currentExpenses + expenseImpact;
        const projectedNetIncome = projectedRevenue - projectedExpenses;
        
        // Calculate debt service coverage (simplified - would need actual debt service payment)
        const debtService = (kpis?.outstanding_debt || 8.1) * 10 * 0.05; // Assume 5% annual debt service
        const debtServiceCoverage = debtService > 0 ? projectedNetIncome / debtService : 0;
        
        // Determine financial viability
        const financialViability = projectedNetIncome > 0 && debtServiceCoverage > 1.25 ? 'Healthy' : 'At Risk';
        
        return {
            projectedRevenue,
            projectedExpenses,
            projectedNetIncome,
            debtServiceCoverage,
            financialViability
        };
    };
    
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
                    isConversational: true,
                    type: responseType || 'text'
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
                        summary: summary || 'Summary generated successfully.',
                        type: responseType || (sql ? 'sql' : 'text')
                    });
                } else {
                    // Summary generation failed, but we can still show SQL/results
                    const errorText = await summaryResponse.text();
                    console.warn('Summary generation failed:', errorText);
                    const isSqlType = responseType === 'sql' || (responseType !== 'text' && sql);
                    setAiResponse({
                        success: true,
                        sql: sql || null,
                        data: sqlResults,
                        summary: sqlResults 
                            ? `Query executed successfully. ${Array.isArray(sqlResults) ? sqlResults.length : Object.keys(sqlResults || {}).length} rows returned.`
                            : (isSqlType && sql ? `SQL generated: ${sql}` : 'Question processed successfully.'),
                        type: responseType || (sql ? 'sql' : 'text')
                    });
                }
            } catch (summaryErr) {
                console.warn('Summary generation error:', summaryErr);
                // Fallback: show SQL/results even if summary fails
                const isSqlType = responseType === 'sql' || (responseType !== 'text' && sql);
                setAiResponse({
                    success: true,
                    sql: sql || null,
                    data: sqlResults,
                    summary: sqlResults 
                        ? `Query executed successfully. ${Array.isArray(sqlResults) ? sqlResults.length : Object.keys(sqlResults || {}).length} rows returned.`
                        : (isSqlType && sql ? `SQL generated: ${sql}` : 'Question processed successfully.'),
                    type: responseType || (sql ? 'sql' : 'text')
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
<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
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
                                    <h3 style={{ 
                                        fontSize: '16px', 
                                        fontWeight: '700', 
                                        color: '#1B5B7E', 
                                        marginBottom: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <Lightbulb size={18} color="#1B5B7E" />
                                        AI Response
                                    </h3>
                                    <div style={{ 
                                        whiteSpace: 'pre-wrap', 
                                        lineHeight: '1.6',
                                        marginBottom: '15px',
                                        padding: '18px',
                                        background: '#F0F9FF',
                                        borderRadius: '8px',
                                        border: '1px solid #BAE6FD',
                                        color: '#374151',
                                        fontSize: '14px',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                                    }}>
                                        {aiResponse.sql || aiResponse.summary || aiResponse.error}
                                    </div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        color: '#6B7280', 
                                        padding: '12px',
                                        background: '#F9FAFB',
                                        borderRadius: '6px',
                                        border: '1px solid #E5E7EB',
                                        marginTop: '15px'
                                    }}>
                                        <strong style={{ color: '#1B5B7E' }}>💡 Tip:</strong> Try asking a specific question about your data, like "What was the total revenue in 2024?" or "Show me budget variance by department"
                                    </div>
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
                            {aiResponse.summary && !aiResponse.isConversational && !aiResponse.hasError && (() => {
                                const parsedSummary = parseSummary(aiResponse.summary);
                                const tableData = aiResponse.data && Array.isArray(aiResponse.data) && aiResponse.data.length > 0 
                                    ? formatTableData(aiResponse.data) 
                                    : null;
                                
                                return (
                                    <div>
                                        <h3 style={{ 
                                            fontSize: '16px', 
                                            fontWeight: '700', 
                                            color: '#1B5B7E', 
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <Lightbulb size={18} color="#1B5B7E" />
                                            AI Analysis
                                        </h3>
                                        
                                        {/* 1. SQL Query - Show First */}
                                        {aiResponse.sql && (aiResponse.type === 'sql' || aiResponse.type === undefined) && (
                                            <div style={{ marginBottom: '25px' }}>
                                                <h4 style={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: '600', 
                                                    color: '#1B5B7E',
                                                    marginBottom: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <Search size={16} color="#689EC2" />
                                                    Generated SQL Query
                                                </h4>
                                                <pre style={{ 
                                                    background: '#1F2937', 
                                                    color: '#F9FAFB',
                                                    padding: '15px', 
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    overflow: 'auto',
                                                    fontFamily: 'Monaco, "Courier New", monospace',
                                                    lineHeight: '1.6',
                                                    border: '1px solid #374151',
                                                    margin: 0
                                                }}>
                                                    {aiResponse.sql}
                                                </pre>
                                            </div>
<<<<<<< Updated upstream
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
=======
                                        )}
                                        
                                        {/* 2. Based on the Question */}
                                        {parsedSummary.question && (
                                            <div style={{ 
                                                background: '#F0F9FF',
                                                border: '1px solid #BAE6FD',
                                                borderRadius: '8px',
                                                padding: '15px',
                                                marginBottom: '20px'
>>>>>>> Stashed changes
                                            }}>
                                                <h4 style={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: '600', 
                                                    color: '#1B5B7E',
                                                    marginBottom: '10px'
                                                }}>
                                                    Based on the Question
                                                </h4>
                                                <p style={{ 
                                                    color: '#374151',
                                                    fontSize: '14px',
                                                    margin: 0,
                                                    fontStyle: 'italic'
                                                }}>
                                                    "{parsedSummary.question}"
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* 3. Query Results Table */}
                                        {tableData && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <h4 style={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: '600', 
                                                    color: '#1B5B7E',
                                                    marginBottom: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <Target size={16} color="#1B5B7E" />
                                                    Query Results ({aiResponse.row_count || aiResponse.data.length} row{aiResponse.data.length !== 1 ? 's' : ''})
                                                </h4>
                                                <div style={{ 
                                                    overflowX: 'auto',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E5E7EB',
                                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                    <table style={{ 
                                                        width: '100%',
                                                        borderCollapse: 'collapse',
                                                        background: '#FFFFFF',
                                                        fontSize: '13px'
                                                    }}>
                                                        <thead>
                                                            <tr style={{ 
                                                                background: '#F9FAFB',
                                                                borderBottom: '2px solid #E5E7EB'
                                                            }}>
                                                                {tableData.columns.map((col, colIdx) => (
                                                                    <th key={colIdx} style={{ 
                                                                        padding: '12px 15px',
                                                                        textAlign: 'left',
                                                                        fontWeight: '600',
                                                                        color: '#1B5B7E',
                                                                        fontSize: '12px',
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.5px'
                                                                    }}>
                                                                        {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {tableData.rows.map((row, rowIdx) => (
                                                                <tr key={rowIdx} style={{ 
                                                                    borderBottom: rowIdx < tableData.rows.length - 1 ? '1px solid #F3F4F6' : 'none',
                                                                    transition: 'background-color 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}>
                                                                    {tableData.columns.map((col, colIdx) => {
                                                                        const value = row[col];
                                                                        const isCurrency = col.toLowerCase().includes('revenue') || 
                                                                                          col.toLowerCase().includes('amount') || 
                                                                                          col.toLowerCase().includes('cost') ||
                                                                                          col.toLowerCase().includes('expense') ||
                                                                                          col.toLowerCase().includes('income') ||
                                                                                          col.toLowerCase().includes('budget');
                                                                        const formattedValue = isCurrency && typeof value === 'number' 
                                                                            ? formatCurrency(value * 10) 
                                                                            : formatNumber(value);
                                                                        
                                                                        return (
                                                                            <td key={colIdx} style={{ 
                                                                                padding: '12px 15px',
                                                                                color: '#374151',
                                                                                fontWeight: isCurrency ? '600' : '400'
                                                                            }}>
                                                                                {formattedValue}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* 4. Key Statistics */}
                                        {parsedSummary.keyStats.length > 0 && (
                                            <div style={{ 
                                                background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                                                border: '1px solid #7DD3FC',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                marginBottom: '20px',
                                                boxShadow: '0 2px 8px rgba(27, 91, 126, 0.1)'
                                            }}>
                                                <h4 style={{ 
                                                    fontSize: '15px', 
                                                    fontWeight: '700', 
                                                    color: '#1B5B7E',
                                                    marginBottom: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    <Target size={18} color="#1B5B7E" />
                                                    Key Statistics
                                                </h4>
                                                <div style={{ 
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                                    gap: '12px'
                                                }}>
                                                    {parsedSummary.keyStats.map((stat, idx) => {
                                                        const [key, ...valueParts] = stat.split(':');
                                                        const value = valueParts.join(':').trim();
                                                        
                                                        // Parse value to extract min, max, avg if present
                                                        const minMatch = value.match(/min=([\d.]+)/);
                                                        const maxMatch = value.match(/max=([\d.]+)/);
                                                        const avgMatch = value.match(/avg=([\d.]+)/);
                                                        
                                                        const isNumericValue = /^[\d.]+$/.test(value.trim());
                                                        const formattedValue = isNumericValue && parseFloat(value) 
                                                            ? formatNumber(parseFloat(value))
                                                            : value;
                                                        
                                                        return (
                                                            <div key={idx} style={{ 
                                                                background: '#FFFFFF',
                                                                border: '1px solid #BAE6FD',
                                                                borderRadius: '8px',
                                                                padding: '14px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '6px',
                                                                transition: 'all 0.2s',
                                                                boxShadow: '0 1px 3px rgba(27, 91, 126, 0.08)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 91, 126, 0.15)';
                                                                e.currentTarget.style.borderColor = '#7DD3FC';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(27, 91, 126, 0.08)';
                                                                e.currentTarget.style.borderColor = '#BAE6FD';
                                                            }}>
                                                                <div style={{ 
                                                                    fontSize: '11px',
                                                                    fontWeight: '600',
                                                                    color: '#689EC2',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    {key.trim().replace(/_/g, ' ')}
                                                                </div>
                                                                {minMatch || maxMatch || avgMatch ? (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                        {minMatch && (
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                                <span style={{ color: '#6B7280' }}>Min:</span>
                                                                                <strong style={{ color: '#1B5B7E' }}>{formatNumber(parseFloat(minMatch[1]))}</strong>
                                                                            </div>
                                                                        )}
                                                                        {maxMatch && (
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                                <span style={{ color: '#6B7280' }}>Max:</span>
                                                                                <strong style={{ color: '#1B5B7E' }}>{formatNumber(parseFloat(maxMatch[1]))}</strong>
                                                                            </div>
                                                                        )}
                                                                        {avgMatch && (
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                                <span style={{ color: '#6B7280' }}>Avg:</span>
                                                                                <strong style={{ color: '#1B5B7E' }}>{formatNumber(parseFloat(avgMatch[1]))}</strong>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ 
                                                                        fontSize: '16px',
                                                                        fontWeight: '700',
                                                                        color: '#1B5B7E',
                                                                        marginTop: '4px'
                                                                    }}>
                                                                        {formattedValue}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* 5. Data Section */}
                                        {parsedSummary.data.length > 0 && (
                                            <div style={{ 
                                                background: '#F9FAFB',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                                padding: '15px',
                                                marginBottom: '20px'
                                            }}>
                                                <h4 style={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: '600', 
                                                    color: '#1B5B7E',
                                                    marginBottom: '12px'
                                                }}>
                                                    Data
                                                </h4>
                                                <div style={{ 
                                                    fontFamily: 'Monaco, "Courier New", monospace',
                                                    fontSize: '12px',
                                                    color: '#374151',
                                                    lineHeight: '1.8'
                                                }}>
                                                    {parsedSummary.data.map((line, idx) => (
                                                        <div key={idx}>{line}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Other content if any */}
                                        {parsedSummary.other.length > 0 && (
                                            <div style={{ 
                                                background: '#F0F9FF',
                                                border: '1px solid #BAE6FD',
                                                borderRadius: '8px',
                                                padding: '15px',
                                                marginTop: '20px',
                                                lineHeight: '1.6'
                                            }}>
                                                {parsedSummary.other.map((line, idx) => (
                                                    <div key={idx} style={{ 
                                                        marginBottom: '8px',
                                                        color: '#374151',
                                                        fontSize: '13px'
                                                    }}>
                                                        {line}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                            
                            {/* Response with data but no summary */}
<<<<<<< Updated upstream
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
=======
                            {!aiResponse.summary && !aiResponse.isConversational && aiResponse.data && Array.isArray(aiResponse.data) && aiResponse.data.length > 0 && (() => {
                                const tableData = formatTableData(aiResponse.data);
                                if (!tableData) return null;
                                
                                return (
                                    <div>
                                        <h3 style={{ 
                                            fontSize: '16px', 
                                            fontWeight: '700', 
                                            color: '#1B5B7E', 
                                            marginBottom: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <Target size={18} color="#1B5B7E" />
                                            Query Results
                                        </h3>
                                        <p style={{ 
                                            color: '#6B7280', 
                                            fontSize: '13px',
                                            marginBottom: '15px'
                                        }}>
                                            Found {aiResponse.row_count || aiResponse.data.length} result{aiResponse.data.length !== 1 ? 's' : ''}
                                        </p>
                                        <div style={{ 
                                            overflowX: 'auto',
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                            marginBottom: '15px'
                                        }}>
                                            <table style={{ 
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                background: '#FFFFFF',
                                                fontSize: '13px'
>>>>>>> Stashed changes
                                            }}>
                                                <thead>
                                                    <tr style={{ 
                                                        background: '#F9FAFB',
                                                        borderBottom: '2px solid #E5E7EB'
                                                    }}>
                                                        {tableData.columns.map((col, colIdx) => (
                                                            <th key={colIdx} style={{ 
                                                                padding: '12px 15px',
                                                                textAlign: 'left',
                                                                fontWeight: '600',
                                                                color: '#1B5B7E',
                                                                fontSize: '12px',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableData.rows.map((row, rowIdx) => (
                                                        <tr key={rowIdx} style={{ 
                                                            borderBottom: rowIdx < tableData.rows.length - 1 ? '1px solid #F3F4F6' : 'none'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}>
                                                            {tableData.columns.map((col, colIdx) => {
                                                                const value = row[col];
                                                                const isCurrency = col.toLowerCase().includes('revenue') || 
                                                                                  col.toLowerCase().includes('amount') || 
                                                                                  col.toLowerCase().includes('cost') ||
                                                                                  col.toLowerCase().includes('expense') ||
                                                                                  col.toLowerCase().includes('income') ||
                                                                                  col.toLowerCase().includes('budget');
                                                                const formattedValue = isCurrency && typeof value === 'number' 
                                                                    ? formatCurrency(value * 10) 
                                                                    : formatNumber(value);
                                                                
                                                                return (
                                                                    <td key={colIdx} style={{ 
                                                                        padding: '12px 15px',
                                                                        color: '#374151',
                                                                        fontWeight: isCurrency ? '600' : '400'
                                                                    }}>
                                                                        {formattedValue}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {aiResponse.sql && (aiResponse.type === 'sql' || aiResponse.type === undefined) && (
                                            <details style={{ marginTop: '10px' }}>
                                                <summary style={{ 
                                                    cursor: 'pointer', 
                                                    color: '#689EC2', 
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    padding: '8px 12px',
                                                    background: '#F9FAFB',
                                                    borderRadius: '6px',
                                                    border: '1px solid #E5E7EB',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#F3F4F6';
                                                    e.currentTarget.style.borderColor = '#689EC2';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#F9FAFB';
                                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                                }}>
                                                    <Search size={14} />
                                                    View SQL Query
                                                </summary>
                                                <pre style={{ 
                                                    background: '#1F2937', 
                                                    color: '#F9FAFB',
                                                    padding: '15px', 
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    marginTop: '8px',
                                                    overflow: 'auto',
                                                    fontFamily: 'Monaco, "Courier New", monospace',
                                                    lineHeight: '1.5',
                                                    border: '1px solid #374151'
                                                }}>
                                                    {aiResponse.sql}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                );
                            })()}
                            
                            {/* No data found */}
                            {!aiResponse.summary && !aiResponse.isConversational && !aiResponse.hasError && (!aiResponse.data || (Array.isArray(aiResponse.data) && aiResponse.data.length === 0)) && (
                                <div>
                                    <h3>AI Response:</h3>
                                    <p>No data found for your query.</p>
                                    {aiResponse.sql && (aiResponse.type === 'sql' || aiResponse.type === undefined) && (
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
                    <span className="fh-title-icon">
                        <svg width="34" height="40" viewBox="0 0 34 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Three vertical bars increasing in height */}
                            <rect x="4" y="28" width="4" height="8" fill="#1B5B7E"/>
                            <rect x="10" y="24" width="4" height="12" fill="#1B5B7E"/>
                            <rect x="16" y="18" width="4" height="18" fill="#1B5B7E"/>
                            {/* Coin with dollar sign above the tallest bar */}
                            <circle cx="18" cy="12" r="6" fill="#1B5B7E"/>
                            <text x="18" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial, sans-serif" fontWeight="bold">$</text>
                        </svg>
                    </span>
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
                            onChange={(e) => setRateIncrease(parseFloat(e.target.value))}
                            className="fh-slider"
                        />
                        <div className="fh-impact-text positive">
                            Revenue impact: {calculateRateIncreaseImpact() >= 0 ? '+' : ''}{formatCurrency(calculateRateIncreaseImpact())}
                        </div>
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
                            onChange={(e) => setWaterLoss(parseFloat(e.target.value))}
                            className="fh-slider"
                        />
                        <div className="fh-impact-text positive">
                            Revenue impact: {calculateWaterLossImpact() >= 0 ? '+' : ''}{formatCurrency(calculateWaterLossImpact())}
                        </div>
                    </div>

                    <div className="fh-scenario-input">
                        <div className="fh-input-label-row">
                            <span>Expense Growth</span>
                            <span className="fh-input-value">{expenseGrowth}.00%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={expenseGrowth}
                            onChange={(e) => setExpenseGrowth(parseFloat(e.target.value))}
                            className="fh-slider"
                        />
                        <div className="fh-impact-text negative">
                            Expense impact: {calculateExpenseImpact() >= 0 ? '+' : ''}{formatCurrency(calculateExpenseImpact())}
                        </div>
                    </div>

                    <div className="fh-scenario-input">
                        <input 
                            type="text" 
                            className="fh-scenario-name-input" 
                            placeholder="Scenario Name" 
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                        />
                        <button className="fh-save-btn">Save</button>
                    </div>

                    <div className="fh-scenario-impact-box">
                        <div className="fh-impact-header">SCENARIO IMPACT</div>
                        {(() => {
                            const impact = calculateScenarioImpact();
                            return (
                                <>
                                    <div className="fh-impact-row">
                                        <span>Projected Revenue</span>
                                        <span className={impact.projectedRevenue > 0 ? 'fh-impact-positive' : 'fh-impact-negative'}>
                                            {formatCurrency(impact.projectedRevenue)}
                                        </span>
                                    </div>
                                    <div className="fh-impact-row">
                                        <span>Net Income</span>
                                        <span className={impact.projectedNetIncome > 0 ? 'fh-impact-positive' : 'fh-impact-negative'}>
                                            {formatCurrency(impact.projectedNetIncome)}
                                        </span>
                                    </div>
                                    <div className="fh-impact-row">
                                        <span>Debt Service Coverage</span>
                                        <span className={impact.debtServiceCoverage > 1.25 ? 'fh-impact-positive' : 'fh-impact-negative'}>
                                            {impact.debtServiceCoverage.toFixed(2)}x
                                        </span>
                                    </div>
                                    <div className="fh-impact-row">
                                        <span>Financial Viability</span>
                                        <span className={impact.financialViability === 'Healthy' ? 'fh-impact-positive' : 'fh-impact-negative'}>
                                            {impact.financialViability}
                                        </span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    <div className="fh-key-insights-box">
                        <div className="fh-insights-header">KEY INSIGHTS</div>
                        {(() => {
                            const impact = calculateScenarioImpact();
                            const insights = [];
                            
                            if (impact.projectedNetIncome > 0) {
                                insights.push(
                                    <div key="net-income" className="fh-insight-item">
                                        <CheckCircle size={7} color="#16A34A" strokeWidth={1} />
                                        <span>Scenario generates positive net income</span>
                                    </div>
                                );
                            } else {
                                insights.push(
                                    <div key="net-income-negative" className="fh-insight-item">
                                        <XCircle size={7} color="#DC2626" strokeWidth={1} />
                                        <span>Scenario results in negative net income</span>
                                    </div>
                                );
                            }
                            
                            if (impact.debtServiceCoverage > 1.25) {
                                insights.push(
                                    <div key="debt-coverage" className="fh-insight-item">
                                        <CheckCircle size={7} color="#16A34A" strokeWidth={1} />
                                        <span>Debt service coverage is healthy ({impact.debtServiceCoverage.toFixed(2)}x)</span>
                                    </div>
                                );
                            } else {
                                insights.push(
                                    <div key="debt-coverage-low" className="fh-insight-item">
                                        <AlertTriangle size={7} color="#FD9C46" strokeWidth={1} />
                                        <span>Debt service coverage below recommended threshold ({impact.debtServiceCoverage.toFixed(2)}x)</span>
                                    </div>
                                );
                            }
                            
                            if (rateIncrease > 0 && calculateRateIncreaseImpact() > 0) {
                                insights.push(
                                    <div key="rate-increase" className="fh-insight-item blue">
                                        <span>Rate increase generates {formatCurrency(calculateRateIncreaseImpact())} in additional revenue</span>
                                    </div>
                                );
                            }
                            
                            if (waterLoss > 0 && calculateWaterLossImpact() > 0) {
                                insights.push(
                                    <div key="water-loss" className="fh-insight-item blue">
                                        <span>Water loss reduction recovers {formatCurrency(calculateWaterLossImpact())} in revenue</span>
                                    </div>
                                );
                            }
                            
                            return insights.length > 0 ? insights : [
                                <div key="no-insights" className="fh-insight-item">
                                    <span>Adjust scenario parameters to see insights</span>
                                </div>
                            ];
                        })()}
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
                    <span className="fh-title-icon">
                        <svg width="34" height="40" viewBox="0 0 34 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Cloud-like/blob shape on the left */}
                            <path d="M8 20C8 16 10 12 14 12C14 10 16 8 18 8C20 8 22 10 22 12C24 12 26 14 26 16C26 18 24 20 22 20L14 20C12 20 10 18 10 16C10 14 8 16 8 20Z" fill="#1B5B7E"/>
                            {/* Three horizontal lines extending to the right with circular nodes */}
                            {/* Top line (angles slightly upwards) */}
                            <line x1="26" y1="14" x2="30" y2="12" stroke="#1B5B7E" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="30" cy="12" r="2" fill="#1B5B7E"/>
                            {/* Middle line (horizontal) */}
                            <line x1="26" y1="20" x2="30" y2="20" stroke="#1B5B7E" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="30" cy="20" r="2" fill="#1B5B7E"/>
                            {/* Bottom line (angles slightly downwards) */}
                            <line x1="26" y1="26" x2="30" y2="28" stroke="#1B5B7E" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="30" cy="28" r="2" fill="#1B5B7E"/>
                        </svg>
                    </span>
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
                    <span className="fh-title-icon">
                        <svg width="34" height="40" viewBox="0 0 34 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Central Coin with Dollar Sign */}
                            <circle cx="17" cy="20" r="6" fill="#1B5B7E"/>
                            <text x="17" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial, sans-serif" fontWeight="bold">$</text>
                            
                            {/* Circular Arrow/Loop - forms complete circle around coin, starts bottom-left */}
                            <path d="M 11 26.5 A 6 6 0 0 1 11 13.5 A 6 6 0 0 1 23 13.5 A 6 6 0 0 1 25 16" 
                                  stroke="#1B5B7E" 
                                  strokeWidth="2.5" 
                                  fill="none" 
                                  strokeLinecap="round"/>
                            
                            {/* Arrow head at top-right end of loop */}
                            <path d="M 25 16 L 22.5 14.5 L 24 17.5 Z" fill="#1B5B7E"/>
                            
                            {/* Sprout emerging from top-right of arrow */}
                            {/* Stem */}
                            <line x1="25" y1="16" x2="25" y2="11" stroke="#1B5B7E" strokeWidth="2" strokeLinecap="round"/>
                            {/* Left leaf - small rounded leaf curving left */}
                            <path d="M 25 11 Q 23.5 9.5 23 11 Q 23.5 10.5 25 11" fill="#1B5B7E"/>
                            {/* Right leaf - small rounded leaf curving right */}
                            <path d="M 25 11 Q 26.5 9.5 27 11 Q 26.5 10.5 25 11" fill="#1B5B7E"/>
                        </svg>
                    </span>
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
