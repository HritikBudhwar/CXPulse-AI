"""Explainable AI — business-rule risk factor generator."""

from typing import Any


def generate_risk_factors(customer: dict[str, Any]) -> list[dict[str, str]]:
    factors: list[dict[str, str]] = []

    days_purchase = customer.get("days_since_last_purchase", 0)
    if days_purchase > 30:
        factors.append(
            {
                "factor": f"No purchase in {days_purchase} days",
                "severity": "high" if days_purchase > 60 else "medium",
            }
        )

    days_visit = customer.get("days_since_last_visit", 0)
    if days_visit > 30:
        factors.append(
            {
                "factor": f"Website inactivity for {days_visit} days",
                "severity": "high" if days_visit > 90 else "medium",
            }
        )

    email_rate = customer.get("email_open_rate", 1)
    if email_rate < 0.2:
        factors.append(
            {
                "factor": "Email engagement declined",
                "severity": "high" if email_rate < 0.1 else "medium",
            }
        )

    sentiment = customer.get("sentiment_score", 0.5)
    if sentiment < 0.5:
        factors.append(
            {
                "factor": "Negative support sentiment",
                "severity": "high" if sentiment < 0.3 else "medium",
            }
        )

    csat = customer.get("csat_score", 3)
    if csat < 3:
        factors.append(
            {
                "factor": f"Low CSAT score ({csat}/5)",
                "severity": "medium",
            }
        )

    tickets = customer.get("support_tickets", 0)
    if tickets >= 2:
        factors.append(
            {
                "factor": f"{tickets} support complaints raised",
                "severity": "high" if tickets >= 4 else "medium",
            }
        )

    sessions = customer.get("website_sessions", 0)
    if sessions < 10:
        factors.append(
            {
                "factor": "Declining website engagement",
                "severity": "medium",
            }
        )

    if customer.get("unsubscribe_flag", 0) == 1:
        factors.append(
            {
                "factor": "Unsubscribed from marketing emails",
                "severity": "high",
            }
        )

    severity_order = {"high": 0, "medium": 1, "low": 2}
    factors.sort(key=lambda x: severity_order.get(x["severity"], 2))
    return factors[:5]
