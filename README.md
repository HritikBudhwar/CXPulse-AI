# CXPulse AI

**An AI-powered Omnichannel Customer Health Platform** that unifies customer touchpoints across website, email, purchases, and support to predict churn, explain risk, recommend actions, and simulate intervention impact.

## Demo Story

> CXPulse AI continuously monitors customer interactions across websites, emails, purchases, and support systems to generate a unified Customer Health Score. It predicts which customers are likely to churn, explains the reasons behind the risk, recommends personalized interventions using generative AI, and simulates the impact of those actions before execution.

## Architecture

```
Customer Data → Health Score Engine → Churn Model → Risk Factors → GenAI Recommendations → Simulator → Dashboard
```

## Project Structure

```
├── frontend/          # React + Vite dashboard
├── backend/
│   ├── app.py         # Flask API server
│   ├── data/          # Customer datasets
│   ├── ml/            # Health score, churn model, simulator
│   └── ai/            # Gemini recommendation engine
└── synthetic_customer_activity_joined.csv
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Process raw data into customer schema
python data/process_data.py

# Train churn prediction model
python ml/train.py

# Start API server
python app.py
```

Backend runs at **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### 3. Gemini AI (Optional)

For live GenAI recommendations, set your API key:

```bash
export GEMINI_API_KEY=your_key_here
```

Without a key, the system uses intelligent rule-based fallback recommendations.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | KPIs, health distribution, churn trend |
| `/api/customers` | GET | Customer list with search/filter |
| `/api/customers/:id` | GET | Full profile, risk factors, recommendations |
| `/api/insights` | GET | High-risk, upsell, follow-up, priority actions |
| `/api/simulator` | POST | What-if intervention simulation |

## Screens

1. **Executive Dashboard** — KPIs, health pie chart, churn trend, top risk table
2. **Customer Explorer** — Search, profile, health gauge, risk factors, AI recommendations
3. **Omnichannel Journey** — Cross-channel interaction timeline
4. **AI Insights Center** — Prioritized actions and opportunities
5. **Impact Simulator** — Discount slider, support/loyalty toggles, revenue impact

## Modules

| Module | Description |
|--------|-------------|
| Data Layer | Multi-channel customer features from CSV |
| Health Score Engine | 0–100 composite score (Healthy / Needs Attention / At Risk) |
| Churn Prediction | Random Forest classifier with accuracy metrics |
| Explainable AI | Business-rule risk factor generator |
| GenAI Recommendations | Gemini-powered next-best-action (with fallback) |
| Impact Simulator | What-if churn reduction and revenue saved |

## Tech Stack

- **Frontend:** React, Vite, Recharts, Lucide Icons
- **Backend:** Flask, pandas, scikit-learn
- **ML:** Random Forest (churn), weighted composite (health score)
- **AI:** Google Gemini 2.0 Flash (optional)
