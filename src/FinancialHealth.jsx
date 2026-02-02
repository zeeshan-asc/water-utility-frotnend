import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, ReferenceLine
} from 'recharts';
import {
    Search, TrendingUp, TrendingDown, AlertCircle, AlertTriangle, CheckCircle, XCircle, Flag, Lightbulb, Target, Trash2
} from 'lucide-react';
import PageNavigation from './PageNavigation';
import './FinancialHealth.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Module-level cache to store financial health data (persists across remounts)
let financialHealthDataCache = {
    kpis: null,
    revenueTrends: [],
    budgetVariance: [],
    arAging: [],
    debtData: [],
    operationalMargins: [],
    alerts: [],
    revenueSummary: null,
    scenarios: [],
    backendHealth: null,
    aiHealth: null,
    loaded: false
};

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
    const [scenarioTab, setScenarioTab] = useState('manual');

    // AI Chatbot states
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiChatHistory, setAiChatHistory] = useState([]);
    const [aiStatusMessage, setAiStatusMessage] = useState('');

    // Health check states
    const [backendHealth, setBackendHealth] = useState(null);
    const [aiHealth, setAiHealth] = useState(null);

    const chatContainerRef = useRef(null);

    // Auto-scroll to bottom when chat history changes or loading state updates
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [aiChatHistory, aiLoading, aiStatusMessage]);

    // Restore chat history from sessionStorage on mount
    useEffect(() => {
        try {
            const stored = window.sessionStorage.getItem('fh-ai-chat-history');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setAiChatHistory(parsed);
                }
            }
        } catch (err) {
            console.warn('Failed to restore AI chat history from sessionStorage:', err);
        }
    }, []);

    // Persist chat history to sessionStorage whenever it changes
    useEffect(() => {
        try {
            if (aiChatHistory && aiChatHistory.length > 0) {
                window.sessionStorage.setItem('fh-ai-chat-history', JSON.stringify(aiChatHistory));
            } else {
                window.sessionStorage.removeItem('fh-ai-chat-history');
            }
        } catch (err) {
            console.warn('Failed to persist AI chat history to sessionStorage:', err);
        }
    }, [aiChatHistory]);

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

    // Fetch AI response with progressive disclosure (instant text, no streaming)
    const fetchAIResponse = async (question) => {
        const updateLastTurn = (updates) => {
            setAiChatHistory(prev => {
                const next = [...prev];
                if (next.length > 0) {
                    next[next.length - 1] = { ...next[next.length - 1], ...updates };
                }
                return next;
            });
        };

        try {
            setAiLoading(true);
            setAiError(null);
            setAiStatusMessage('Analyzing your request...');

            // Push the user's question and a placeholder for the assistant immediately
            setAiChatHistory(prev => [...prev, {
                question,
                summary: '',
                type: 'text',
                sql: null,
                data: null,
                isStreaming: true
            }]);

            console.log('Sending AI request:', question);

            // Step 1: Generate SQL
            setAiStatusMessage('Synthesizing optimized SQL query...');
            const generateResponse = await fetch(`${API_BASE_URL}/api/v0/ai/generate-sql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });

            if (!generateResponse.ok) {
                throw new Error(`SQL generation failed: ${generateResponse.status}`);
            }

            const generateJson = await generateResponse.json();
            const sql = generateJson.sql || (generateJson.success && generateJson.data?.sql) || generateJson.query;
            const responseType = generateJson.type || generateJson.data?.type;

            // Update turn with SQL as soon as we have it
            updateLastTurn({
                sql: sql || null,
                type: responseType || (sql ? 'sql' : 'text')
            });

            const isTextResponse = responseType === 'text' ||
                (sql && (sql.includes('not allowed') || sql.includes('error') || sql.includes('LLM')));

            if (isTextResponse && sql) {
                updateLastTurn({ summary: sql, isStreaming: false });
                setAiLoading(false);
                return;
            }

            // Step 2: Run SQL
            let sqlResults = null;
            if (sql && !isTextResponse) {
                try {
                    setAiStatusMessage('Executing database query...');
                    const runResponse = await fetch(`${API_BASE_URL}/api/v0/ai/run-sql`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sql })
                    });

                    if (runResponse.ok) {
                        const runJson = await runResponse.json();
                        sqlResults = runJson.success ? runJson.data : runJson;
                        // Show results immediately
                        updateLastTurn({ data: sqlResults });
                    }
                } catch (runErr) {
                    console.warn('SQL execution error:', runErr);
                }
            }

            // Step 3: Generate Summary
            try {
                setAiStatusMessage('Generating final insights...');
                const summaryResponse = await fetch(`${API_BASE_URL}/api/v0/vanna/generate_summary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question, sql, results: sqlResults })
                });

                if (summaryResponse.ok) {
                    const summaryJson = await summaryResponse.json();
                    const summary = summaryJson.summary || summaryJson.text || summaryJson.data?.summary || summaryJson.data;
                    updateLastTurn({ summary: summary || 'Analysis complete.' });
                } else {
                    updateLastTurn({ summary: 'Query completed, but summary generation failed.' });
                }
            } catch (summaryErr) {
                console.warn('Summary error:', summaryErr);
                updateLastTurn({ summary: 'Results fetched successfully.' });
            }

            updateLastTurn({ isStreaming: false });
        } catch (err) {
            console.error('AI Error:', err);
            setAiError(err.message);
            updateLastTurn({
                summary: `Error: ${err.message}`,
                isStreaming: false
            });
        } finally {
            setAiLoading(false);
            setAiStatusMessage('');
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
        // If data has already been loaded and cached, restore it
        if (financialHealthDataCache.loaded && financialHealthDataCache.kpis !== null) {
            setKpis(financialHealthDataCache.kpis);
            setRevenueTrends(financialHealthDataCache.revenueTrends);
            setBudgetVariance(financialHealthDataCache.budgetVariance);
            setArAging(financialHealthDataCache.arAging);
            setDebtData(financialHealthDataCache.debtData);
            setOperationalMargins(financialHealthDataCache.operationalMargins);
            setAlerts(financialHealthDataCache.alerts);
            setRevenueSummary(financialHealthDataCache.revenueSummary);
            setScenarios(financialHealthDataCache.scenarios);
            setBackendHealth(financialHealthDataCache.backendHealth);
            setAiHealth(financialHealthDataCache.aiHealth);
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check backend health first
                let backendHealthStatus = 'unreachable';
                try {
                    const backendResponse = await fetch(`${API_BASE_URL}/health`);
                    const backendData = await backendResponse.json();
                    backendHealthStatus = backendData.status === 'healthy' ? 'healthy' : 'unhealthy';
                    setBackendHealth(backendHealthStatus);
                    financialHealthDataCache.backendHealth = backendHealthStatus;
                } catch (err) {
                    console.warn('Backend health check failed:', err);
                    backendHealthStatus = 'unreachable';
                    setBackendHealth(backendHealthStatus);
                    financialHealthDataCache.backendHealth = backendHealthStatus;
                }

                if (backendHealthStatus !== 'healthy') {
                    setError('Backend API is not reachable. Please ensure the server is running at ' + API_BASE_URL);
                    setLoading(false);
                    return;
                }

                // Check AI health
                let aiHealthStatus = 'unreachable';
                try {
                    const aiResponse = await fetch(`${API_BASE_URL}/api/v0/ai/health`);
                    if (aiResponse.ok) {
                        const aiJson = await aiResponse.json();
                        const status = aiJson.status || (aiJson.success && aiJson.data?.status) || 'unhealthy';
                        aiHealthStatus = status === 'healthy' ? 'healthy' : 'unhealthy';
                    }
                    setAiHealth(aiHealthStatus);
                    financialHealthDataCache.aiHealth = aiHealthStatus;
                } catch (err) {
                    console.warn('AI health check failed:', err);
                    aiHealthStatus = 'unreachable';
                    setAiHealth(aiHealthStatus);
                    financialHealthDataCache.aiHealth = aiHealthStatus;
                }

                // Fetch KPIs
                const kpisResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/kpis`);
                const kpisData = await handleApiResponse(kpisResponse);
                setKpis(kpisData);
                financialHealthDataCache.kpis = kpisData;

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
                            financialHealthDataCache.revenueTrends = formattedRevenue;
                        } else {
                            console.warn('No valid revenue data after formatting, using fallback');
                            setRevenueTrends([]); // Will trigger fallback in chart
                            financialHealthDataCache.revenueTrends = [];
                        }
                    } else {
                        console.warn('Revenue trends API returned empty or invalid data, using fallback');
                        setRevenueTrends([]); // Will trigger fallback in chart
                        financialHealthDataCache.revenueTrends = [];
                    }
                } catch (err) {
                    console.error('Failed to fetch revenue trends:', err);
                    setRevenueTrends([]); // Will trigger fallback in chart
                    financialHealthDataCache.revenueTrends = [];
                }

                // Fetch Budget Variance
                try {
                    const budgetResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/budget-variance`);
                    const budgetData = await handleApiResponse(budgetResponse);
                    const budgetVarianceData = budgetData || [];
                    setBudgetVariance(budgetVarianceData);
                    financialHealthDataCache.budgetVariance = budgetVarianceData;
                } catch (err) {
                    console.warn('Failed to fetch budget variance:', err);
                    financialHealthDataCache.budgetVariance = [];
                }

                // Fetch AR Aging
                try {
                    const arResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/ar-aging`);
                    const arData = await handleApiResponse(arResponse);
                    const arAgingData = arData?.aging_breakdown || [];
                    setArAging(arAgingData);
                    financialHealthDataCache.arAging = arAgingData;
                } catch (err) {
                    console.warn('Failed to fetch AR aging:', err);
                    financialHealthDataCache.arAging = [];
                }

                // Fetch Scenarios
                try {
                    const scenariosResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/scenarios`);
                    const scenariosData = await handleApiResponse(scenariosResponse);
                    const scenariosArray = Array.isArray(scenariosData) ? scenariosData : [];
                    setScenarios(scenariosArray);
                    financialHealthDataCache.scenarios = scenariosArray;
                } catch (err) {
                    console.warn('Failed to fetch scenarios:', err);
                    financialHealthDataCache.scenarios = [];
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
                    financialHealthDataCache.debtData = dscrData;
                } catch (err) {
                    console.warn('Failed to fetch debt data:', err);
                    financialHealthDataCache.debtData = [];
                }

                // Fetch Alerts
                try {
                    const alertsResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/alerts?limit=4`);
                    const alertsData = await handleApiResponse(alertsResponse);
                    const alertsArray = Array.isArray(alertsData) ? alertsData : [];
                    setAlerts(alertsArray);
                    financialHealthDataCache.alerts = alertsArray;
                } catch (err) {
                    console.warn('Failed to fetch alerts:', err);
                    financialHealthDataCache.alerts = [];
                }

                // Fetch Revenue Summary
                try {
                    const summaryResponse = await fetch(`${API_BASE_URL}/api/v0/dashboard/revenue/summary`);
                    const summaryData = await handleApiResponse(summaryResponse);
                    setRevenueSummary(summaryData);
                    financialHealthDataCache.revenueSummary = summaryData;
                } catch (err) {
                    console.warn('Failed to fetch revenue summary:', err);
                    financialHealthDataCache.revenueSummary = null;
                }

                // Don't fetch initial AI response automatically - let user submit first
                // fetchAIResponse(aiQuestion);

                // Mark data as loaded after successful fetch
                financialHealthDataCache.loaded = true;

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

        const trimmed = aiQuestion.trim();
        if (trimmed) {
            setAiQuestion(''); // Clear immediately for best UX
            fetchAIResponse(trimmed);
        } else {
            console.warn('Question is empty, not submitting');
            setAiError('Please enter a question');
        }
    };

    // Handle Save Scenario
    const handleSaveScenario = async () => {
        if (!scenarioName.trim()) {
            // Simple validation
            console.warn('Scenario name is required');
            return;
        }

        const newScenario = {
            name: scenarioName,
            rate_increase: rateIncrease,
            water_loss_reduction: waterLoss,
            expense_growth: expenseGrowth,
            timestamp: new Date().toISOString()
        };

        try {
            // Attempt to save to backend
            const response = await fetch(`${API_BASE_URL}/api/v0/dashboard/scenarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newScenario)
            });

            // Even if the backend POST isn't perfectly implemented, we update local state
            setScenarios(prev => [...prev, newScenario]);
            setScenarioName('');

            // Visual feedback could be added here (e.g., a toast or temporary success state)
            console.log('Scenario saved:', newScenario);
        } catch (err) {
            console.error('Failed to save scenario:', err);
            // Fallback to local state update
            setScenarios(prev => [...prev, newScenario]);
            setScenarioName('');
        }
    };

    const renderAiSearchBar = () => (
        <div className="fh-ai-search-bar">
            <form
                onSubmit={handleAIQuestionSubmit}
                style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}
            >
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
                        padding: '8px',
                        borderRadius: '20px',
                        color: aiLoading ? '#9CA3AF' : '#FFFFFF',
                        minWidth: '40px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={!aiQuestion.trim() ? 'Enter a question first' : 'Submit question'}
                    aria-label="Submit question"
                >
                    {aiLoading ? '...' : <Search size={16} />}
                </button>
            </form>
        </div>
    );

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
                {/* Header Skeleton */}
                <div className="skeleton-header">
                    <div>
                        <div className="skeleton skeleton-title"></div>
                        <div className="skeleton skeleton-subtitle" style={{ marginTop: '8px' }}></div>
                    </div>
                    <div className="skeleton-health-indicators">
                        <div className="skeleton skeleton-health-badge"></div>
                        <div className="skeleton skeleton-health-badge"></div>
                    </div>
                </div>

                {/* Tab Navigation Skeleton */}
                <div className="skeleton skeleton-tabs"></div>

                {/* KPI Cards - Row 1 Skeleton */}
                <div className="skeleton-kpi-grid-row1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton-kpi-card">
                            <div className="skeleton skeleton-kpi-label"></div>
                            <div className="skeleton skeleton-kpi-value"></div>
                            <div className="skeleton skeleton-kpi-change"></div>
                        </div>
                    ))}
                </div>

                {/* KPI Cards - Row 2 Skeleton */}
                <div className="skeleton-kpi-grid-row2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton-kpi-card">
                            <div className="skeleton skeleton-kpi-label"></div>
                            <div className="skeleton skeleton-kpi-value"></div>
                            <div className="skeleton skeleton-kpi-change"></div>
                        </div>
                    ))}
                </div>

                {/* AI Query Section Skeleton */}
                <div className="skeleton-ai-section">
                    <div className="skeleton-search-bar">
                        <div className="skeleton skeleton-search-icon"></div>
                        <div className="skeleton skeleton-search-input"></div>
                        <div className="skeleton skeleton-search-button"></div>
                    </div>
                    <div className="skeleton skeleton-response-box"></div>
                </div>

                {/* Charts Skeleton */}
                <div className="skeleton skeleton-chart"></div>
                <div className="skeleton skeleton-chart"></div>
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
                <div className="fh-page-header-wrapper">
                    <div>
                        <h1 className="fh-brand-title">
                            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>AquaSentinel™</Link>
                        </h1>
                        <p className="fh-brand-subtitle">CFO Command Intelligence for Financial, Operational, Billing & Compliance Oversight</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <PageNavigation />

            {/* KPI Cards - Row 1 */}
            <div className="fh-kpi-grid-row1">
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Operating Margin</div>
                    <div className="fh-kpi-value">{((kpis?.operating_margin || 0.184) * 100).toFixed(1)}%</div>
                    <div className="fh-kpi-change positive"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> +2.3%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Days Sales Outstanding</div>
                    <div className="fh-kpi-value">{kpis?.days_sales_outstanding || 38}</div>
                    <div className="fh-kpi-change negative"><TrendingDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> -3.2%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Non Revenue Water %</div>
                    <div className="fh-kpi-value">{((kpis?.non_revenue_water_pct || 0.231) * 100).toFixed(1)}%</div>
                    <div className="fh-kpi-change negative"><TrendingDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> -1.8%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Cost per Gallon</div>
                    <div className="fh-kpi-value">${kpis?.cost_per_gallon?.toFixed(2) || '4.27'}</div>
                    <div className="fh-kpi-change positive"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> +4.27%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Collection Rate</div>
                    <div className="fh-kpi-value">{((kpis?.collection_rate || 0.942) * 100).toFixed(2)}%</div>
                    <div className="fh-kpi-change positive"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> +2.1%</div>
                </div>
            </div>

            {/* KPI Cards - Row 2 */}
            <div className="fh-kpi-grid-row2">
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Annual Revenue</div>
                    <div className="fh-kpi-value">{formatCurrency((kpis?.total_revenue || 26.5) * 10)}</div>
                    <div className="fh-kpi-change positive"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> +3.2% vs last year</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Water Revenue</div>
                    <div className="fh-kpi-value">{formatCurrency((kpis?.water_revenue || 47.2) * 10)}</div>
                    <div className="fh-kpi-change positive"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> +2.1%</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Cash Reserve</div>
                    <div className="fh-kpi-value">{formatCurrency((kpis?.cash_reserve || 4.2) * 10)}</div>
                    <div className="fh-kpi-change positive"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> +12% from last quarter</div>
                </div>
                <div className="fh-kpi-card">
                    <div className="fh-kpi-label">Debt Service Coverage</div>
                    <div className="fh-kpi-value">{kpis?.debt_service_coverage?.toFixed(1) || '2.9'}x</div>
                    <div className="fh-kpi-change positive"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> +8.2%</div>
                </div>
            </div>

            {/* AI Query Section */}
            <div className="fh-ai-query-section" id="ai-chat-section">
                <div className="fh-ai-query-header">
                    <div className="fh-ai-query-title">
                        <Lightbulb size={20} />
                        AI Financial Co-pilot
                    </div>
                    {aiChatHistory.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to clear your chat history?")) {
                                    setAiChatHistory([]);
                                }
                            }}
                            className="fh-clear-chat-btn"
                            style={{
                                background: 'rgba(104, 158, 194, 0.1)',
                                border: '1px solid rgba(104, 158, 194, 0.2)',
                                color: '#1B5B7E',
                                fontSize: '11px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Trash2 size={12} />
                            Clear History
                        </button>
                    )}
                </div>

                <div className="fh-ai-response-box" ref={chatContainerRef}>
                    {aiChatHistory.length === 0 && !aiLoading && (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 4px 12px rgba(27, 91, 126, 0.1)'
                            }}>
                                <Lightbulb size={32} color="#1B5B7E" />
                            </div>
                            <h3 style={{ fontSize: '20px', color: '#1B5B7E', marginBottom: '10px', fontWeight: 700 }}>How can I help you today?</h3>
                            <p style={{ color: '#6B7280', maxWidth: '400px', margin: '0 auto 24px', fontSize: '14px' }}>
                                Ask anything about your financial data, revenue trends, or budget variances.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '540px', margin: '0 auto' }}>
                                {[
                                    "Total revenue in 2024?",
                                    "Revenue by quarter",
                                    "Highest budget variance?",
                                    "Average operating margin?"
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            fetchAIResponse(suggestion);
                                            setAiQuestion('');
                                        }}
                                        className="fh-suggestion-chip"
                                        style={{
                                            padding: '12px 14px',
                                            background: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '10px',
                                            fontSize: '13px',
                                            color: '#374151',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Search size={14} color="#689EC2" />
                                        <span>{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {aiChatHistory.map((turn, idx) => {
                        const isLast = idx === aiChatHistory.length - 1;
                        const hasStructuredData = turn.type !== 'text' && (turn.sql || (turn.data && turn.data.length > 0));
                        const parsedSummary = hasStructuredData ? parseSummary(turn.summary) : null;
                        const tableData = hasStructuredData && turn.data ? formatTableData(turn.data) : null;

                        return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* User Message */}
                                <div className="fh-chat-message user">
                                    <div className="fh-chat-bubble user">
                                        {turn.question}
                                    </div>
                                </div>

                                {/* Assistant Message */}
                                <div className="fh-chat-message assistant">
                                    <div className="fh-chat-bubble assistant">
                                        <div style={{ width: '100%' }}>
                                            {/* SQL Toggle (Query - Top) */}
                                            {turn.sql && (
                                                <details style={{ marginBottom: '15px' }}>
                                                    <summary style={{ fontSize: '12px', cursor: 'pointer', color: '#689EC2', fontWeight: 600 }}>View Generated Query</summary>
                                                    <pre style={{
                                                        fontSize: '11px',
                                                        background: '#1F2937',
                                                        color: '#F9FAFB',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        overflow: 'auto',
                                                        marginTop: '10px'
                                                    }}>
                                                        {turn.sql}
                                                    </pre>
                                                </details>
                                            )}

                                            {/* Table (Data - Middle) */}
                                            {tableData && (
                                                <div style={{ marginBottom: '15px' }}>
                                                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                            <thead style={{ background: '#F9FAFB' }}>
                                                                <tr>
                                                                    {tableData.columns.slice(0, 5).map(col => (
                                                                        <th key={col} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', color: '#1B5B7E' }}>
                                                                            {col.replace(/_/g, ' ')}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {tableData.rows.slice(0, 5).map((row, i) => (
                                                                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                        {tableData.columns.slice(0, 5).map(col => (
                                                                            <td key={col} style={{ padding: '8px' }}>{formatNumber(row[col])}</td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {tableData.rows.length > 5 && (
                                                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '5px' }}>
                                                            Showing 5 of {tableData.rows.length} rows.
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Insights (Summary - Bottom) */}
                                            <div className="fh-ai-insights-rendered">
                                                {/* Text content from parsed summary */}
                                                {(parsedSummary && (parsedSummary.other.length > 0 || parsedSummary.keyStats.length > 0)) ? (
                                                    <div style={{ marginBottom: '15px' }}>
                                                        {parsedSummary.other.map((line, i) => (
                                                            <div key={i} style={{ marginBottom: '8px' }}>{line}</div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ marginBottom: '15px' }}>
                                                        {turn.summary || (turn.isStreaming && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                <div style={{ fontSize: '11px', color: '#689EC2', fontStyle: 'italic' }}>
                                                                    {aiStatusMessage}
                                                                </div>
                                                                <div className="fh-typing-indicator">
                                                                    <span></span>
                                                                    <span></span>
                                                                    <span></span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Key Stats */}
                                                {parsedSummary && parsedSummary.keyStats.length > 0 && (
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                                        gap: '10px'
                                                    }}>
                                                        {parsedSummary.keyStats.map((stat, i) => {
                                                            const [label, ...valParts] = stat.split(':');
                                                            const val = valParts.join(':').trim();
                                                            return (
                                                                <div key={i} style={{
                                                                    background: '#F0F9FF',
                                                                    padding: '10px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #BAE6FD'
                                                                }}>
                                                                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#689EC2', fontWeight: 600 }}>{label}</div>
                                                                    <div style={{ fontSize: '14px', color: '#1B5B7E', fontWeight: 700 }}>{val}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {aiLoading && (!aiChatHistory.length || !aiChatHistory[aiChatHistory.length - 1]?.isStreaming) && (
                        <div className="fh-chat-message assistant">
                            <div className="fh-chat-bubble assistant" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                padding: '12px 16px',
                                minWidth: '200px'
                            }}>
                                <div style={{ fontSize: '11px', color: '#689EC2', fontWeight: 500 }}>
                                    {aiStatusMessage}
                                </div>
                                <div className="fh-typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {aiError && (
                        <div className="fh-chat-message assistant">
                            <div className="fh-chat-bubble assistant" style={{ border: '1px solid #FECACA', background: '#FEF2F2', color: '#991B1B' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={16} />
                                    <strong>Error:</strong>
                                </div>
                                <div style={{ marginTop: '5px', fontSize: '13px' }}>{aiError}</div>
                            </div>
                        </div>
                    )}
                </div>

                {renderAiSearchBar()}
            </div>

            {/* Section Title */}
            <div className="fh-section-header">
                <h2 className="fh-section-title">
                    <span className="fh-title-icon">
                        <svg width="34" height="40" viewBox="0 0 34 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Three vertical bars increasing in height */}
                            <rect x="4" y="28" width="4" height="8" fill="#1B5B7E" />
                            <rect x="10" y="24" width="4" height="12" fill="#1B5B7E" />
                            <rect x="16" y="18" width="4" height="18" fill="#1B5B7E" />
                            {/* Coin with dollar sign above the tallest bar */}
                            <circle cx="18" cy="12" r="6" fill="#1B5B7E" />
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
                    <div style={{ flex: 1, minHeight: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
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
                    </div>
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
                        <ResponsiveContainer width="100%" height="100%">
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
                            <button
                                className={`fh-scenario-tab ${scenarioTab === 'manual' ? 'active' : ''}`}
                                onClick={() => setScenarioTab('manual')}
                            >
                                Manual
                            </button>
                            <button
                                className={`fh-scenario-tab ${scenarioTab === 'presets' ? 'active' : ''}`}
                                onClick={() => setScenarioTab('presets')}
                            >
                                Presets
                            </button>
                        </div>
                    </div>

                    {scenarioTab === 'manual' ? (
                        <>
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
                                <button
                                    className="fh-save-btn"
                                    onClick={handleSaveScenario}
                                    disabled={!scenarioName.trim()}
                                >
                                    Save
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="fh-presets-list">
                            {scenarios.length > 0 ? (
                                scenarios.map((s, idx) => (
                                    <div key={idx} className="fh-preset-item"
                                        onClick={() => {
                                            setRateIncrease(s.rate_increase || 0);
                                            setWaterLoss(s.water_loss_reduction || 0);
                                            setExpenseGrowth(s.expense_growth || 0);
                                            setScenarioTab('manual');
                                        }}>
                                        <div className="fh-preset-name">{s.name}</div>
                                        <div className="fh-preset-details">
                                            <span>Rate: +{s.rate_increase}%</span>
                                            <span>Loss: -{s.water_loss_reduction}%</span>
                                            <span>Exp: +{s.expense_growth}%</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="fh-no-presets">
                                    No saved scenarios yet.
                                </div>
                            )}
                        </div>
                    )}

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
                    <div style={{ flex: 1, minHeight: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
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
                    </div>
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
                            <path d="M8 20C8 16 10 12 14 12C14 10 16 8 18 8C20 8 22 10 22 12C24 12 26 14 26 16C26 18 24 20 22 20L14 20C12 20 10 18 10 16C10 14 8 16 8 20Z" fill="#1B5B7E" />
                            {/* Three horizontal lines extending to the right with circular nodes */}
                            {/* Top line (angles slightly upwards) */}
                            <line x1="26" y1="14" x2="30" y2="12" stroke="#1B5B7E" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="30" cy="12" r="2" fill="#1B5B7E" />
                            {/* Middle line (horizontal) */}
                            <line x1="26" y1="20" x2="30" y2="20" stroke="#1B5B7E" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="30" cy="20" r="2" fill="#1B5B7E" />
                            {/* Bottom line (angles slightly downwards) */}
                            <line x1="26" y1="26" x2="30" y2="28" stroke="#1B5B7E" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="30" cy="28" r="2" fill="#1B5B7E" />
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
                            <circle cx="17" cy="20" r="6" fill="#1B5B7E" />
                            <text x="17" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial, sans-serif" fontWeight="bold">$</text>

                            {/* Circular Arrow/Loop - forms complete circle around coin, starts bottom-left */}
                            <path d="M 11 26.5 A 6 6 0 0 1 11 13.5 A 6 6 0 0 1 23 13.5 A 6 6 0 0 1 25 16"
                                stroke="#1B5B7E"
                                strokeWidth="2.5"
                                fill="none"
                                strokeLinecap="round" />

                            {/* Arrow head at top-right end of loop */}
                            <path d="M 25 16 L 22.5 14.5 L 24 17.5 Z" fill="#1B5B7E" />

                            {/* Sprout emerging from top-right of arrow */}
                            {/* Stem */}
                            <line x1="25" y1="16" x2="25" y2="11" stroke="#1B5B7E" strokeWidth="2" strokeLinecap="round" />
                            {/* Left leaf - small rounded leaf curving left */}
                            <path d="M 25 11 Q 23.5 9.5 23 11 Q 23.5 10.5 25 11" fill="#1B5B7E" />
                            {/* Right leaf - small rounded leaf curving right */}
                            <path d="M 25 11 Q 26.5 9.5 27 11 Q 26.5 10.5 25 11" fill="#1B5B7E" />
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
                    <Target size={25} className="fh-title-icon" />
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

        </div>
    );
};

export default FinancialHealth;
