# AquaSentinel Backend API

CFO Command Intelligence API for Financial, Operational, Billing & Compliance Oversight

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Generate data (if not already generated)
python waterdata.py

# Start the server
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔗 API Endpoints

### Core Endpoints

#### Health & Status
- `GET /` - API root with endpoint list
- `GET /health` - Health check

#### Financial KPIs
- `GET /api/kpis` - Current financial KPIs with changes
  ```json
  {
    "operating_margin": 18.4,
    "days_sales_outstanding": 38,
    "non_revenue_water_pct": 23.1,
    "cost_per_gallon": 4.27,
    "collection_rate": 94.2,
    "annual_revenue": 26.5,
    ...
  }
  ```

#### Revenue Performance
- `GET /api/revenue/summary` - Revenue summary with variance
- `GET /api/revenue/trends?period=monthly&start_date=2024-01-01` - Revenue trends over time
  - Query params: `start_date`, `end_date`, `period` (monthly/quarterly/yearly)

#### Budget Variance
- `GET /api/budget-variance?department=Operations` - Budget variance by department
- `GET /api/budget-variance/trends?department=Operations` - Trends for specific department

#### Accounts Receivable
- `GET /api/ar-aging` - Current AR aging distribution
- `GET /api/ar-aging/trends?months=12` - AR aging trends

#### Debt Sustainability
- `GET /api/debt` - Current debt metrics
- `GET /api/debt/trends?months=24` - Debt coverage trends

#### Operational Metrics
- `GET /api/operational/margins?months=12` - Operational margin trends

#### Efficiency Alerts
- `GET /api/alerts?limit=10` - Recent efficiency alerts
- `GET /api/alerts/summary` - Summary by alert type

#### Scenario Planning
- `GET /api/scenarios` - Current scenario projections
- `GET /api/scenarios/trends?scenario=Rate Increase` - Trends for specific scenario

#### Departments
- `GET /api/departments` - List all departments
- `GET /api/departments/{department}/performance?months=12` - Department performance

#### Analytics
- `GET /api/analytics/summary` - Comprehensive dashboard summary
- `GET /api/export/full-dataset` - Export complete latest dataset

## 📊 Data Structure

### Main Dataset (`aquasentinel_dashboard_data.csv`)
Contains 26 columns with monthly time-series data:
- Core financial metrics (revenue, margins, costs)
- Accounts receivable aging
- Debt sustainability metrics
- Operational breakdowns

### Supplementary Datasets
- `aquasentinel_departments.csv` - Department-level budget variance
- `aquasentinel_alerts.csv` - Efficiency alerts & opportunities
- `aquasentinel_scenarios.csv` - Scenario planning projections

## 🎯 Frontend Integration

### Example Fetch Requests

```javascript
// Get KPIs for dashboard header
const kpis = await fetch('http://localhost:8000/api/kpis')
  .then(res => res.json());

// Get revenue trends for chart
const revenueTrends = await fetch('http://localhost:8000/api/revenue/trends?period=monthly')
  .then(res => res.json());

// Get efficiency alerts
const alerts = await fetch('http://localhost:8000/api/alerts?limit=5')
  .then(res => res.json());
```

### CORS Configuration
CORS is enabled for all origins by default. In production, update the `allow_origins` in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    ...
)
```

## 🛠️ Technology Stack

- **FastAPI** - Modern, fast web framework
- **Uvicorn** - ASGI server
- **Pandas** - Data manipulation
- **Pydantic** - Data validation

## 📝 API Response Examples

### KPIs Endpoint Response
```json
{
  "operating_margin": 18.4,
  "days_sales_outstanding": 38,
  "non_revenue_water_pct": 23.1,
  "cost_per_gallon": 4.27,
  "collection_rate": 94.2,
  "annual_revenue": 26.5,
  "water_revenue": 47.2,
  "cash_reserve": 4.2,
  "debt_service_coverage": 2.9,
  "operating_margin_change": "+2.3%",
  "dso_change": "-1.2%",
  "nrw_change": "-1.8%",
  "cost_per_gallon_change": "+0.5%",
  "collection_rate_change": "+0.3%"
}
```

### Revenue Trends Response
```json
{
  "data": [
    {
      "period": "2024-01",
      "actual_revenue": 35.5,
      "budgeted_revenue": 32.4,
      "revenue_variance": 3.1
    },
    ...
  ]
}
```

### Efficiency Alerts Response
```json
{
  "alerts": [
    {
      "date_str": "2024-12-01",
      "alert_type": "Revenue Optimization Opportunity",
      "description": "Dynamic pricing could increase revenue",
      "potential_impact_k": 150.5,
      "confidence_level": 0.92
    },
    ...
  ],
  "alert_types": [
    "Revenue Optimization Opportunity",
    "Q1 Profitability Forecast",
    "Revenue Leakage Detected",
    "Cost Optimization Opportunity"
  ]
}
```

## 🔧 Customization

### Adding New Endpoints
Add new route handlers in `main.py`:

```python
@app.get("/api/custom-endpoint")
def custom_endpoint():
    # Your logic here
    return {"data": "your data"}
```

### Filtering & Pagination
Most endpoints support query parameters for filtering:
- `?months=12` - Limit to last N months
- `?start_date=2024-01-01` - Filter from date
- `?end_date=2024-12-31` - Filter to date
- `?limit=10` - Limit number of results

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in main.py or use uvicorn:
uvicorn main:app --port 8001
```

### CSV Files Not Found
Make sure to run `python waterdata.py` first to generate the data files.

### CORS Issues
Update the `allow_origins` list in the CORS middleware configuration.

## 📄 License

MIT License

