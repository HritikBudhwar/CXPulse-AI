"""GenAI Recommendation Engine with Gemini + rule-based fallback."""

import json
import os
from typing import Any

import google.generativeai as genai

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


def _fallback_recommendations(customer: dict, risk_factors: list) -> list[dict]:
    recs = []
    segment = customer.get("segment", "Standard")
    churn_prob = customer.get("churn_probability", 50)
    health = customer.get("health_score", 50)

    factor_text = " ".join(r["factor"].lower() for r in risk_factors)

    if "purchase" in factor_text or customer.get("days_since_last_purchase", 0) > 30:
        discount = 15 if churn_prob > 70 else 10
        recs.append(
            {
                "action": f"Offer a {discount}% loyalty discount",
                "reason": "Customer shows declining engagement and purchase inactivity.",
                "expected_impact": "Improve retention likelihood by re-engaging with value offer.",
            }
        )

    if "support" in factor_text or "sentiment" in factor_text or customer.get("support_tickets", 0) >= 2:
        recs.append(
            {
                "action": "Arrange priority support callback",
                "reason": "Negative support experience detected; proactive resolution builds trust.",
                "expected_impact": "Reduce churn risk through personalized issue resolution.",
            }
        )

    if "email" in factor_text:
        recs.append(
            {
                "action": "Send personalized re-engagement email campaign",
                "reason": "Email engagement has dropped significantly.",
                "expected_impact": "Restore communication channel and drive return visits.",
            }
        )

    if health >= 70 and customer.get("total_spent", 0) > 500:
        recs.append(
            {
                "action": f"Upsell premium {segment} bundle",
                "reason": "Healthy customer with strong purchase history.",
                "expected_impact": "Increase customer lifetime value.",
            }
        )

    if not recs:
        recs.append(
            {
                "action": "Schedule quarterly check-in call",
                "reason": "Maintain relationship and gather feedback proactively.",
                "expected_impact": "Strengthen loyalty and detect issues early.",
            }
        )

    return recs[:3]


def get_recommendations(customer: dict, risk_factors: list) -> list[dict]:
    if not GEMINI_API_KEY:
        return _fallback_recommendations(customer, risk_factors)

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        factors_str = "\n".join(f"• {r['factor']}" for r in risk_factors)
        prompt = f"""You are a customer retention strategist for CXPulse AI.

Customer Profile:
- ID: {customer.get('customer_id')}
- Segment: {customer.get('segment')}
- Health Score: {customer.get('health_score')}/100
- Churn Risk: {customer.get('churn_probability')}%

Risk Factors:
{factors_str}

Suggest exactly 2 retention actions. Return ONLY valid JSON array:
[
  {{"action": "...", "reason": "...", "expected_impact": "..."}}
]
Keep each field concise (1 sentence)."""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        recs = json.loads(text)
        if isinstance(recs, list) and len(recs) > 0:
            return recs[:3]
    except Exception:
        pass

    return _fallback_recommendations(customer, risk_factors)
