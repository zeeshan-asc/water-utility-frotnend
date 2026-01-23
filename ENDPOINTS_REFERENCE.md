# Complete Endpoints Reference

**Base URL:** `http://localhost:8000`

All endpoints return JSON responses. Each request includes a unique `X-Request-ID` header for tracking.

---

## Table of Contents

1. [Dashboard Endpoints](#dashboard-endpoints)
2. [AI/ML Endpoints](#aiml-endpoints)
3. [Utility Endpoints](#utility-endpoints)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)

---

## Dashboard Endpoints

All dashboard endpoints are prefixed with `/api/v0/dashboard`

---

### 1. Get Financial KPIs

Get comprehensive financial key performance indicators.

```http
GET /api/v0/dashboard/kpis
```

**Description:**
Returns current financial KPIs including revenue, margins, operational metrics, and debt indicators.

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 497.41,
    "budgeted_revenue": 520.0,
    "revenue_variance": -22.59,
    "revenue_variance_pct": -0.043,
    "operating_margin": 0.17,
    "days_sales_outstanding": 42,
    "non_revenue_water_pct": 0.25,
    "cost_per_gallon": 4.15,
    "collection_rate": 0.92,
    "debt_service_coverage": 2.85,
    "water_revenue": 380.5,
    "cash_reserve": 45.2,
    "total_ar": 12.5,
    "outstanding_debt": 8.5,
    "current_pct": 0.59,
    "days_30_pct": 0.29,
    "days_60_pct": 0.12
  }
}
```

**Example:**
```bash
curl http://localhost:8000/api/v0/dashboard/kpis
```

**Python Example:**
```python
import requests
response = requests.get("http://localhost:8000/api/v0/dashboard/kpis")
kpis = response.json()['data']
print(f"Total Revenue: ${kpis['total_revenue']}M")
```

---

### 2. Get Revenue Summary

Get revenue summary with variance analysis.

```http
GET /api/v0/dashboard/revenue/summary
```

**Description:**
Returns revenue summary including total, budgeted, variance, and trend information.

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 497.41,
    "budgeted_revenue": 520.0,
    "variance": -22.59,
    "variance_pct": -0.043,
    "trend": "increasing",
    "periods": [
      {
        "period": "2024-01",
        "revenue": 18.4,
        "budgeted": 22.44,
        "variance": -4.04
      }
    ]
  }
}
```

**Example:**
```bash
curl http://localhost:8000/api/v0/dashboard/revenue/summary
```

---

### 3. Get Revenue Trends

Get revenue trends over time with flexible period grouping.

```http
GET /api/v0/dashboard/revenue/trends
```

**Description:**
Returns revenue trends grouped by period (monthly, quarterly, or yearly).

**Query Parameters:**
- `period` (optional): `monthly`, `quarterly`, or `yearly` (default: `monthly`)
- `start_date` (optional): Start date filter (YYYY-MM-DD format)
- `end_date` (optional): End date filter (YYYY-MM-DD format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-Q1",
      "revenue": 88.57,
      "budgeted": 95.0,
      "variance": -6.43,
      "variance_pct": -0.068
    },
    {
      "period": "2024-Q2",
      "revenue": 106.35,
      "budgeted": 110.0,
      "variance": -3.65,
      "variance_pct": -0.033
    }
  ]
}
```

**Example:**
```bash
# Quarterly trends
curl "http://localhost:8000/api/v0/dashboard/revenue/trends?period=quarterly"

# Monthly trends for specific date range
curl "http://localhost:8000/api/v0/dashboard/revenue/trends?period=monthly&start_date=2024-01-01&end_date=2024-12-31"
```

**Python Example:**
```python
import requests

# Get quarterly trends
response = requests.get(
    "http://localhost:8000/api/v0/dashboard/revenue/trends",
    params={"period": "quarterly"}
)
trends = response.json()['data']

for trend in trends:
    print(f"{trend['period']}: ${trend['revenue']}M")
```

---

### 4. Get Budget Variance

Get budget vs actual variance by department.

```http
GET /api/v0/dashboard/budget-variance
```

**Description:**
Returns department-level budget variance analysis showing budget, actual spending, and variance percentages.

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD format)
- `department` (optional): Filter by department name (e.g., "Operations", "Infrastructure")
- `year` (optional): Filter by year (e.g., 2024)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "department": "Operations",
      "budget": 781.59,
      "actual": 871.15,
      "variance": 89.56,
      "variance_pct": 0.1146
    },
    {
      "date": "2024-01-01",
      "department": "Infrastructure",
      "budget": 543.0,
      "actual": 559.45,
      "variance": 16.45,
      "variance_pct": 0.0303
    }
  ]
}
```

**Example:**
```bash
# All departments
curl http://localhost:8000/api/v0/dashboard/budget-variance

# Specific department
curl "http://localhost:8000/api/v0/dashboard/budget-variance?department=Operations"

# Specific date
curl "http://localhost:8000/api/v0/dashboard/budget-variance?date=2024-01-01"
```

**Python Example:**
```python
import requests

# Get variance for Operations department
response = requests.get(
    "http://localhost:8000/api/v0/dashboard/budget-variance",
    params={"department": "Operations"}
)
variance_data = response.json()['data']

for item in variance_data:
    print(f"{item['date']}: {item['variance_pct']*100:.2f}% variance")
```

---

### 5. Get AR Aging

Get accounts receivable aging analysis.

```http
GET /api/v0/dashboard/ar-aging
```

**Description:**
Returns accounts receivable aging breakdown showing current, 30-day, and 60-day+ buckets.

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "total_ar": 12.5,
    "current_pct": 0.59,
    "days_30_pct": 0.29,
    "days_60_pct": 0.12,
    "aging_breakdown": [
      {
        "bucket": "current",
        "amount": 7.38,
        "percentage": 0.59
      },
      {
        "bucket": "30_days",
        "amount": 3.63,
        "percentage": 0.29
      },
      {
        "bucket": "60_days",
        "amount": 1.50,
        "percentage": 0.12
      }
    ],
    "latest_date": "2024-12-01"
  }
}
```

**Example:**
```bash
curl http://localhost:8000/api/v0/dashboard/ar-aging
```

**Python Example:**
```python
import requests

response = requests.get("http://localhost:8000/api/v0/dashboard/ar-aging")
ar_data = response.json()['data']

print(f"Total AR: ${ar_data['total_ar']}M")
print(f"Current: {ar_data['current_pct']*100:.1f}%")
print(f"30 Days: {ar_data['days_30_pct']*100:.1f}%")
print(f"60+ Days: {ar_data['days_60_pct']*100:.1f}%")
```

---

### 6. Get Debt Metrics

Get debt service coverage and related debt metrics.

```http
GET /api/v0/dashboard/debt
```

**Description:**
Returns comprehensive debt metrics including coverage ratios and outstanding debt.

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "outstanding_debt": 8.5,
    "debt_service_coverage": 2.85,
    "projected_coverage": 1.4,
    "required_minimum": 1.25,
    "actual_coverage": 1.43,
    "status": "healthy",
    "coverage_trend": "stable",
    "latest_date": "2024-12-01"
  }
}
```

**Example:**
```bash
curl http://localhost:8000/api/v0/dashboard/debt
```

**Python Example:**
```python
import requests

response = requests.get("http://localhost:8000/api/v0/dashboard/debt")
debt_data = response.json()['data']

print(f"Outstanding Debt: ${debt_data['outstanding_debt']}M")
print(f"Debt Service Coverage: {debt_data['debt_service_coverage']:.2f}")
print(f"Status: {debt_data['status']}")
```

---

### 7. Get Efficiency Alerts

Get system-generated efficiency alerts and opportunities.

```http
GET /api/v0/dashboard/alerts
```

**Description:**
Returns alerts including profitability forecasts, cost optimization opportunities, and revenue optimization alerts.

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD format)
- `alert_type` (optional): Filter by alert type (e.g., "Q1 Profitability Forecast")
- `limit` (optional): Limit number of results (default: all)
- `confidence_min` (optional): Minimum confidence level (0-1, default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "alert_type": "Q1 Profitability Forecast",
      "description": "Q1 net income expected to reach target",
      "potential_impact_k": 258.7,
      "confidence_level": 0.81
    },
    {
      "date": "2024-02-01",
      "alert_type": "Cost Optimization Opportunity",
      "description": "Reducing NRW could recover costs",
      "potential_impact_k": 295.3,
      "confidence_level": 0.85
    }
  ]
}
```

**Example:**
```bash
# All alerts
curl http://localhost:8000/api/v0/dashboard/alerts

# High confidence alerts only
curl "http://localhost:8000/api/v0/dashboard/alerts?confidence_min=0.8"

# Specific alert type
curl "http://localhost:8000/api/v0/dashboard/alerts?alert_type=Cost Optimization Opportunity"

# Limit results
curl "http://localhost:8000/api/v0/dashboard/alerts?limit=5"
```

**Python Example:**
```python
import requests

# Get high-confidence alerts
response = requests.get(
    "http://localhost:8000/api/v0/dashboard/alerts",
    params={"confidence_min": 0.8, "limit": 10}
)
alerts = response.json()['data']

for alert in alerts:
    print(f"{alert['alert_type']}: {alert['description']}")
    print(f"  Impact: ${alert['potential_impact_k']}K")
    print(f"  Confidence: {alert['confidence_level']*100:.0f}%")
```

---

### 8. Get Scenario Projections

Get financial scenario planning projections.

```http
GET /api/v0/dashboard/scenarios
```

**Description:**
Returns scenario projections including Base Case, Rate Increase, and Water Loss Reduction scenarios.

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD format)
- `scenario` (optional): Filter by scenario type (e.g., "Base Case", "Rate Increase")
- `year` (optional): Filter by year (e.g., 2024)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "scenario": "Base Case",
      "projected_revenue": 24.5,
      "projected_expenses": 18.5,
      "debt_service_coverage": 2.89,
      "net_income": 6.0,
      "financial_viability": "Healthy"
    },
    {
      "date": "2024-01-01",
      "scenario": "Rate Increase",
      "projected_revenue": 27.58,
      "projected_expenses": 18.5,
      "debt_service_coverage": 2.86,
      "net_income": 9.08,
      "financial_viability": "Very Healthy"
    },
    {
      "date": "2024-01-01",
      "scenario": "Water Loss Reduction",
      "projected_revenue": 25.0,
      "projected_expenses": 18.2,
      "debt_service_coverage": 2.59,
      "net_income": 6.8,
      "financial_viability": "Healthy"
    }
  ]
}
```

**Example:**
```bash
# All scenarios
curl http://localhost:8000/api/v0/dashboard/scenarios

# Specific scenario
curl "http://localhost:8000/api/v0/dashboard/scenarios?scenario=Base Case"

# Scenarios for specific year
curl "http://localhost:8000/api/v0/dashboard/scenarios?year=2024"
```

**Python Example:**
```python
import requests

# Get all scenarios for 2024
response = requests.get(
    "http://localhost:8000/api/v0/dashboard/scenarios",
    params={"year": 2024}
)
scenarios = response.json()['data']

for scenario in scenarios:
    print(f"{scenario['scenario']}:")
    print(f"  Revenue: ${scenario['projected_revenue']}M")
    print(f"  Net Income: ${scenario['net_income']}M")
    print(f"  Viability: {scenario['financial_viability']}")
```

---

## AI/ML Endpoints

All AI endpoints are prefixed with `/api/v0/ai`

---

### 9. Ask Question (Natural Language to SQL)

Convert natural language question to SQL and optionally execute it.

```http
POST /api/v0/ai/ask
Content-Type: application/json
```

**Description:**
This is the main AI endpoint that converts natural language questions to SQL queries, executes them, and returns results with summaries.

**Request Body:**
```json
{
  "question": "What was the total revenue in 2024?",
  "run_sql": true
}
```

**Parameters:**
- `question` (required, string): Natural language question about your data
- `run_sql` (optional, boolean): Whether to execute SQL and return data (default: `true`)

**Response:**
```json
{
  "success": true,
  "question": "What was the total revenue in 2024?",
  "sql": "SELECT SUM(actual_revenue) as total_revenue FROM water_data WHERE year = 2024",
  "type": "sql",
  "data": [
    {
      "total_revenue": 497.41
    }
  ],
  "row_count": 1,
  "column_count": 1,
  "summary": "Based on the question: 'What was the total revenue in 2024?'\nThe query returned 1 row(s) with 1 column(s).\n\nKey statistics:\n  - total_revenue: min=497.41, max=497.41, avg=497.41\n\nData:\n total_revenue\n        497.41"
}
```

**Example Questions:**
- "What was the total revenue in 2024?"
- "Show me revenue by quarter for 2023"
- "Which departments had the highest budget variance?"
- "What is the average operating margin?"
- "Show me months with non-revenue water above 25%"
- "What are the projected revenues for all scenarios?"
- "Which scenarios show healthy financial viability?"

**Example:**
```bash
curl -X POST http://localhost:8000/api/v0/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What was the total revenue in 2024?", "run_sql": true}'
```

**Python Example:**
```python
import requests

payload = {
    "question": "What was the total revenue in 2024?",
    "run_sql": True
}

response = requests.post(
    "http://localhost:8000/api/v0/ai/ask",
    json=payload
)

data = response.json()
print(f"SQL: {data['sql']}")
print(f"Result: {data['data']}")
print(f"Summary: {data['summary']}")
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:8000/api/v0/ai/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'What was the total revenue in 2024?',
    run_sql: true
  })
});

const data = await response.json();
console.log('SQL:', data.sql);
console.log('Data:', data.data);
console.log('Summary:', data.summary);
```

**Response Types:**
- `type: "sql"` - SQL query was generated and executed
- `type: "text"` - Informational or conversational response (no SQL)

---

### 10. Generate SQL Only

Generate SQL from natural language without executing it.

```http
GET /api/v0/ai/generate-sql
```

**Description:**
Generates SQL query from natural language question without executing it. Useful for reviewing SQL before execution.

**Query Parameters:**
- `question` (required, string): Natural language question

**Response:**
```json
{
  "success": true,
  "question": "Show me revenue by quarter",
  "sql": "SELECT quarter, SUM(actual_revenue) as total_revenue FROM water_data GROUP BY quarter ORDER BY quarter",
  "type": "sql"
}
```

**Example:**
```bash
curl "http://localhost:8000/api/v0/ai/generate-sql?question=Show me revenue by quarter"
```

**Python Example:**
```python
import requests

question = "Show me revenue by quarter"
response = requests.get(
    "http://localhost:8000/api/v0/ai/generate-sql",
    params={"question": question}
)

data = response.json()
print(f"Generated SQL:\n{data['sql']}")
```

---

### 11. Run SQL Query

Execute a SQL query directly.

```http
POST /api/v0/ai/run-sql
Content-Type: application/json
```

**Description:**
Executes a SQL query directly against the database. Useful for custom queries or testing.

**Request Body:**
```json
{
  "sql": "SELECT * FROM water_data WHERE year = 2024 LIMIT 10"
}
```

**Parameters:**
- `sql` (required, string): SQL query to execute

**Response:**
```json
{
  "success": true,
  "sql": "SELECT * FROM water_data WHERE year = 2024 LIMIT 10",
  "data": [
    {
      "date": "2024-01-01",
      "year": 2024,
      "month": 1,
      "quarter": "Q1",
      "actual_revenue": 18.4,
      "budgeted_revenue": 22.44,
      ...
    }
  ],
  "row_count": 10,
  "column_count": 26
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v0/ai/run-sql \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM water_data WHERE year = 2024 LIMIT 10"}'
```

**Python Example:**
```python
import requests

payload = {
    "sql": "SELECT date, actual_revenue, budgeted_revenue FROM water_data WHERE year = 2024 ORDER BY date"
}

response = requests.post(
    "http://localhost:8000/api/v0/ai/run-sql",
    json=payload
)

data = response.json()
print(f"Rows returned: {data['row_count']}")
for row in data['data']:
    print(row)
```

**Security Note:**
- SQL injection protection is handled by parameterized queries
- Only SELECT queries are recommended
- Database is read-only for safety

---

### 12. AI Health Check

Check AI service health and connectivity.

```http
GET /api/v0/ai/health
```

**Description:**
Verifies that AI services (Vanna AI, OpenAI, Pinecone, Database) are properly configured and connected.

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "service": "Vanna AI",
  "database": "connected",
  "vector_store": "connected"
}
```

**Example:**
```bash
curl http://localhost:8000/api/v0/ai/health
```

**Python Example:**
```python
import requests

response = requests.get("http://localhost:8000/api/v0/ai/health")
health = response.json()

if health['status'] == 'healthy':
    print("AI service is operational")
    print(f"Database: {health['database']}")
    print(f"Vector Store: {health['vector_store']}")
else:
    print(f"AI service error: {health.get('error', 'Unknown')}")
```

---

## Utility Endpoints

---

### 13. Root Endpoint

Get API information and available endpoints.

```http
GET /
```

**Description:**
Returns API metadata and list of all available endpoints.

**Query Parameters:** None

**Response:**
```json
{
  "message": "AquaSentinel API",
  "version": "1.0.0",
  "endpoints": {
    "kpis": "/api/v0/dashboard/kpis",
    "revenue": "/api/v0/dashboard/revenue/summary",
    "revenue_trends": "/api/v0/dashboard/revenue/trends",
    "budget_variance": "/api/v0/dashboard/budget-variance",
    "ar_aging": "/api/v0/dashboard/ar-aging",
    "debt": "/api/v0/dashboard/debt",
    "alerts": "/api/v0/dashboard/alerts",
    "scenarios": "/api/v0/dashboard/scenarios",
    "ai_ask": "/api/v0/ai/ask",
    "ai_generate_sql": "/api/v0/ai/generate-sql",
    "ai_run_sql": "/api/v0/ai/run-sql",
    "ai_health": "/api/v0/ai/health"
  }
}
```

**Example:**
```bash
curl http://localhost:8000/
```

---

### 14. Health Check

Basic health check endpoint.

```http
GET /health
```

**Description:**
Simple health check to verify server is running.

**Query Parameters:** None

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T18:08:01.091032"
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

**Python Example:**
```python
import requests

response = requests.get("http://localhost:8000/health")
health = response.json()

print(f"Status: {health['status']}")
print(f"Timestamp: {health['timestamp']}")
```

---

## Response Format

### Success Response

All successful responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Response Headers

Every response includes:
- `Content-Type: application/json`
- `X-Request-ID: <uuid>` - Unique request identifier for logging

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Endpoint doesn't exist |
| 500 | Internal Server Error - Server error |

### Common Error Responses

**Missing Required Parameter:**
```json
{
  "success": false,
  "error": "Question is required"
}
```

**Invalid Request Format:**
```json
{
  "success": false,
  "error": "Request must be JSON"
}
```

**SQL Execution Error:**
```json
{
  "success": false,
  "error": "SQL execution failed: no such column: invalid_column"
}
```

**AI Service Error:**
```json
{
  "success": false,
  "error": "Failed to initialize Vanna AI: OPENAI_API_KEY environment variable is required"
}
```

---

## Request ID Tracking

Every request includes a unique Request ID in the response header:

```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

Use this ID to:
- Track requests in logs
- Debug issues
- Correlate requests with responses

**Example:**
```python
import requests

response = requests.get("http://localhost:8000/api/v0/dashboard/kpis")
request_id = response.headers.get('X-Request-ID')
print(f"Request ID: {request_id}")
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Implement API key authentication
- Add rate limiting middleware
- Set request throttling

---

## CORS

CORS is enabled for all origins (`*`). For production:
- Configure specific allowed origins
- Set proper CORS headers
- Enable credentials if needed

---

## Authentication

Currently no authentication is required. For production:
- Implement API key authentication
- Use JWT tokens
- Add role-based access control

---

## Best Practices

1. **Always check `success` field** in responses
2. **Use Request IDs** for debugging (from `X-Request-ID` header)
3. **Handle errors gracefully** - check status codes
4. **Use appropriate HTTP methods** - GET for reads, POST for writes
5. **Include proper headers** - Content-Type for POST requests
6. **Validate input** - Check required parameters before sending
7. **Handle timeouts** - Set appropriate timeout values
8. **Cache responses** - Cache static data when possible

---

## Example Workflows

### Workflow 1: Get Dashboard Overview

```python
import requests

BASE_URL = "http://localhost:8000"

# Get KPIs
kpis = requests.get(f"{BASE_URL}/api/v0/dashboard/kpis").json()['data']

# Get Revenue Summary
revenue = requests.get(f"{BASE_URL}/api/v0/dashboard/revenue/summary").json()['data']

# Get Alerts
alerts = requests.get(f"{BASE_URL}/api/v0/dashboard/alerts", params={"limit": 5}).json()['data']

print(f"Total Revenue: ${kpis['total_revenue']}M")
print(f"Operating Margin: {kpis['operating_margin']*100:.1f}%")
print(f"Alerts: {len(alerts)}")
```

### Workflow 2: AI-Powered Analysis

```python
import requests

BASE_URL = "http://localhost:8000"

# Ask AI question
response = requests.post(
    f"{BASE_URL}/api/v0/ai/ask",
    json={
        "question": "Which departments had the highest budget variance in 2024?",
        "run_sql": True
    }
)

data = response.json()
print(f"SQL Generated: {data['sql']}")
print(f"Results: {data['data']}")
print(f"Summary: {data['summary']}")
```

### Workflow 3: Revenue Analysis

```python
import requests

BASE_URL = "http://localhost:8000"

# Get revenue trends
trends = requests.get(
    f"{BASE_URL}/api/v0/dashboard/revenue/trends",
    params={"period": "quarterly", "year": 2024}
).json()['data']

# Ask AI for insights
ai_response = requests.post(
    f"{BASE_URL}/api/v0/ai/ask",
    json={
        "question": "What was the revenue trend in 2024?",
        "run_sql": True
    }
).json()

print("Quarterly Trends:")
for trend in trends:
    print(f"  {trend['period']}: ${trend['revenue']}M")

print(f"\nAI Analysis:\n{ai_response['summary']}")
```

---

## Endpoint Summary

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | GET | `/api/v0/dashboard/kpis` | Get financial KPIs |
| 2 | GET | `/api/v0/dashboard/revenue/summary` | Get revenue summary |
| 3 | GET | `/api/v0/dashboard/revenue/trends` | Get revenue trends |
| 4 | GET | `/api/v0/dashboard/budget-variance` | Get budget variance |
| 5 | GET | `/api/v0/dashboard/ar-aging` | Get AR aging |
| 6 | GET | `/api/v0/dashboard/debt` | Get debt metrics |
| 7 | GET | `/api/v0/dashboard/alerts` | Get efficiency alerts |
| 8 | GET | `/api/v0/dashboard/scenarios` | Get scenario projections |
| 9 | POST | `/api/v0/ai/ask` | Ask natural language question |
| 10 | GET | `/api/v0/ai/generate-sql` | Generate SQL from question |
| 11 | POST | `/api/v0/ai/run-sql` | Execute SQL query |
| 12 | GET | `/api/v0/ai/health` | AI service health check |
| 13 | GET | `/` | API root and endpoints list |
| 14 | GET | `/health` | Basic health check |

**Total: 14 endpoints**

---

**Last Updated:** 2026-01-19  
**API Version:** 1.0.0

