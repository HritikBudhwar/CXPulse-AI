"""CXPulse AI — Flask API server."""

import os
import pickle
import sys
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ml"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ai"))

from health_score import add_health_scores, health_category
from risk_factors import generate_risk_factors
from simulator import simulate_intervention
from recommendations import get_recommendations

app = Flask(__name__)
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "customers.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml", "churn_model.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "ml", "model_metrics.json")

_df: pd.DataFrame | None = None
_model = None
_features: list[str] = []
_metrics: dict = {}


def load_data() -> pd.DataFrame:
    global _df
    if _df is None:
        _df = pd.read_csv(DATA_PATH)
        _df = add_health_scores(_df)
    return _df


def load_model():
    global _model, _features, _metrics
    if _model is None and os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            bundle = pickle.load(f)
            _model = bundle["model"]
            _features = bundle["features"]
    if os.path.exists(METRICS_PATH):
        import json
        with open(METRICS_PATH) as f:
            _metrics = json.load(f)
    return _model


def predict_churn(customer_row: pd.Series) -> float:
    model = load_model()
    if model is None:
        score = customer_row["health_score"]
        return round(max(5, min(95, 100 - score)), 1)

    feature_row = customer_row[_features]
    X = pd.DataFrame([feature_row.values], columns=_features)
    prob = model.predict_proba(X)[0][1] * 100
    return round(float(prob), 1)


def customer_to_dict(row: pd.Series, include_extras: bool = False) -> dict:
    d = row.to_dict()
    d["churn_probability"] = predict_churn(row)
    d["status"] = health_category(d["health_score"])
    if include_extras:
        d["risk_factors"] = generate_risk_factors(d)
        d["recommendations"] = get_recommendations(d, d["risk_factors"])
    return d


def generate_journey(customer: dict) -> list[dict]:
    """Build omnichannel timeline from customer data."""
    ref = datetime(2025, 6, 17)
    events = []

    join = pd.to_datetime(customer.get("join_date", "2020-01-01"))
    events.append(
        {"date": join.strftime("%Y-%m-%d"), "channel": "Account", "event": "Customer joined", "icon": "user"}
    )

    last_visit_days = customer.get("days_since_last_visit", 30)
    visit_date = ref - timedelta(days=int(last_visit_days))
    events.append(
        {
            "date": visit_date.strftime("%Y-%m-%d"),
            "channel": "Website",
            "event": f"Website visit ({customer.get('website_sessions', 0)} total sessions)",
            "icon": "globe",
        }
    )

    if customer.get("emails_opened", 0) > 0:
        email_date = ref - timedelta(days=int(last_visit_days) + 5)
        events.append(
            {
                "date": email_date.strftime("%Y-%m-%d"),
                "channel": "Email",
                "event": f"Opened {customer.get('emails_opened', 0)}/{customer.get('emails_sent', 0)} emails",
                "icon": "mail",
            }
        )

    last_purchase_days = customer.get("days_since_last_purchase", 60)
    if customer.get("orders_count", 0) > 0:
        purchase_date = ref - timedelta(days=int(last_purchase_days))
        events.append(
            {
                "date": purchase_date.strftime("%Y-%m-%d"),
                "channel": "Purchase",
                "event": f"Last purchase (${customer.get('total_spent', 0):.2f} lifetime)",
                "icon": "cart",
            }
        )

    if customer.get("support_tickets", 0) > 0:
        ticket_date = ref - timedelta(days=int(last_visit_days) + 10)
        sentiment = customer.get("sentiment_score", 0.5)
        tone = "negative" if sentiment < 0.5 else "neutral"
        events.append(
            {
                "date": ticket_date.strftime("%Y-%m-%d"),
                "channel": "Support",
                "event": f"{customer.get('support_tickets', 0)} tickets ({tone} sentiment)",
                "icon": "headset",
            }
        )

    events.append(
        {
            "date": ref.strftime("%Y-%m-%d"),
            "channel": "System",
            "event": f"Health score assessed: {customer.get('health_score', 0)}/100",
            "icon": "activity",
        }
    )

    events.sort(key=lambda e: e["date"])
    return events


@app.route("/api/health")
def health_check():
    return jsonify({"status": "ok", "service": "CXPulse AI"})


@app.route("/api/dashboard")
def dashboard():
    df = load_data()
    load_model()

    total = len(df)
    healthy = int((df["health_category"] == "Healthy").sum())
    attention = int((df["health_category"] == "Needs Attention").sum())
    at_risk = int((df["health_category"] == "At Risk").sum())
    avg_health = round(df["health_score"].mean(), 1)

    at_risk_df = df[df["health_category"] == "At Risk"]
    potential_saved = round(at_risk_df["total_spent"].sum() * 0.15, 2)

    distribution = [
        {"name": "Healthy", "value": healthy, "color": "#22c55e"},
        {"name": "Needs Attention", "value": attention, "color": "#f59e0b"},
        {"name": "At Risk", "value": at_risk, "color": "#ef4444"},
    ]

    np.random.seed(42)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    base_rate = df["churn"].mean() * 100
    trend = [
        {"month": m, "churn_rate": round(base_rate + np.random.uniform(-3, 5) + i * 0.8, 1)}
        for i, m in enumerate(months)
    ]

    top_risk = []
    for _, row in df.nsmallest(10, "health_score").iterrows():
        c = customer_to_dict(row)
        top_risk.append(
            {
                "customer_id": c["customer_id"],
                "segment": c["segment"],
                "health_score": c["health_score"],
                "churn_probability": c["churn_probability"],
                "status": c["status"],
            }
        )

    return jsonify(
        {
            "kpis": {
                "total_customers": total,
                "healthy_customers": healthy,
                "needs_attention": attention,
                "at_risk_customers": at_risk,
                "avg_health_score": avg_health,
                "potential_revenue_saved": potential_saved,
            },
            "health_distribution": distribution,
            "churn_trend": trend,
            "top_risk_customers": top_risk,
            "model_metrics": _metrics,
        }
    )


@app.route("/api/customers")
def customers():
    df = load_data()
    search = request.args.get("search", "").strip().lower()
    status = request.args.get("status", "").strip()

    filtered = df.copy()
    if search:
        filtered = filtered[
            filtered["customer_id"].str.lower().str.contains(search)
            | filtered["segment"].str.lower().str.contains(search)
        ]
    if status:
        filtered = filtered[filtered["health_category"] == status]

    result = []
    for _, row in filtered.iterrows():
        c = customer_to_dict(row)
        result.append(
            {
                "customer_id": c["customer_id"],
                "age": c["age"],
                "gender": c["gender"],
                "segment": c["segment"],
                "health_score": c["health_score"],
                "churn_probability": c["churn_probability"],
                "status": c["status"],
                "total_spent": c["total_spent"],
                "days_since_last_purchase": c["days_since_last_purchase"],
            }
        )

    return jsonify({"customers": result, "total": len(result)})


@app.route("/api/customers/<customer_id>")
def customer_detail(customer_id: str):
    df = load_data()
    match = df[df["customer_id"] == customer_id]
    if match.empty:
        return jsonify({"error": "Customer not found"}), 404

    row = match.iloc[0]
    customer = customer_to_dict(row, include_extras=True)
    customer["journey"] = generate_journey(customer)
    return jsonify(customer)


@app.route("/api/insights")
def insights():
    df = load_data()

    high_risk = []
    for _, row in df[df["health_category"] == "At Risk"].nsmallest(8, "health_score").iterrows():
        c = customer_to_dict(row, include_extras=True)
        high_risk.append(
            {
                "customer_id": c["customer_id"],
                "segment": c["segment"],
                "health_score": c["health_score"],
                "churn_probability": c["churn_probability"],
                "top_risk": c["risk_factors"][0]["factor"] if c["risk_factors"] else "Multiple factors",
            }
        )

    upsell = []
    upsell_df = df[(df["health_score"] >= 70) & (df["total_spent"] > 400)].nlargest(8, "total_spent")
    for _, row in upsell_df.iterrows():
        c = customer_to_dict(row)
        upsell.append(
            {
                "customer_id": c["customer_id"],
                "segment": c["segment"],
                "health_score": c["health_score"],
                "total_spent": c["total_spent"],
                "opportunity": f"Premium {c['segment']} upgrade",
            }
        )

    follow_up = []
    follow_df = df[
        (df["health_category"] == "Needs Attention")
        | ((df["support_tickets"] >= 2) & (df["sentiment_score"] < 0.5))
    ].head(8)
    for _, row in follow_df.iterrows():
        c = customer_to_dict(row, include_extras=True)
        follow_up.append(
            {
                "customer_id": c["customer_id"],
                "reason": c["risk_factors"][0]["factor"] if c["risk_factors"] else "Needs review",
                "priority": "High" if c["churn_probability"] > 60 else "Medium",
            }
        )

    priority_actions = []
    seen = set()
    for _, row in df.nsmallest(15, "health_score").iterrows():
        c = customer_to_dict(row, include_extras=True)
        for rec in c.get("recommendations", []):
            key = rec["action"]
            if key not in seen:
                seen.add(key)
                priority_actions.append(
                    {
                        "action": rec["action"],
                        "reason": rec["reason"],
                        "expected_impact": rec["expected_impact"],
                        "customer_id": c["customer_id"],
                    }
                )
            if len(priority_actions) >= 6:
                break
        if len(priority_actions) >= 6:
            break

    return jsonify(
        {
            "high_risk_customers": high_risk,
            "upsell_opportunities": upsell,
            "follow_up_required": follow_up,
            "priority_recommendations": priority_actions,
        }
    )


@app.route("/api/simulator", methods=["POST"])
def simulator():
    data = request.get_json() or {}
    customer_id = data.get("customer_id")
    if not customer_id:
        return jsonify({"error": "customer_id required"}), 400

    df = load_data()
    match = df[df["customer_id"] == customer_id]
    if match.empty:
        return jsonify({"error": "Customer not found"}), 404

    row = match.iloc[0]
    customer = customer_to_dict(row)
    current_risk = customer["churn_probability"]

    result = simulate_intervention(
        customer,
        current_risk,
        discount_pct=float(data.get("discount_pct", 0)),
        support_callback=bool(data.get("support_callback", False)),
        loyalty_bonus=bool(data.get("loyalty_bonus", False)),
    )
    result["customer_id"] = customer_id
    result["customer_name"] = customer_id
    return jsonify(result)


if __name__ == "__main__":
    load_data()
    load_model()
    app.run(debug=True, port=5000, use_reloader=False)
