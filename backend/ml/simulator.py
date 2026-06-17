"""What-If Impact Simulator."""

from typing import Any


def simulate_intervention(
    customer: dict[str, Any],
    current_churn_prob: float,
    discount_pct: float = 0,
    support_callback: bool = False,
    loyalty_bonus: bool = False,
) -> dict[str, Any]:
    reduction = 0.0

    if discount_pct > 0:
        reduction += min(discount_pct * 2.0, 40)

    if support_callback:
        reduction += 12
        if customer.get("sentiment_score", 0.5) < 0.5:
            reduction += 8

    if loyalty_bonus:
        reduction += 10
        if customer.get("days_since_last_purchase", 0) > 30:
            reduction += 5

    if customer.get("health_score", 50) < 40:
        reduction *= 1.1

    predicted_risk = max(5, round(current_churn_prob - reduction, 1))
    risk_reduction = round(current_churn_prob - predicted_risk, 1)

    avg_order = customer.get("average_order_value", 100)
    orders = customer.get("orders_count", 1)
    clv = customer.get("total_spent", avg_order * orders)
    annual_value = clv / max(1, orders) * min(orders, 4)

    revenue_saved = round(annual_value * (risk_reduction / 100), 2)

    return {
        "current_churn_risk": current_churn_prob,
        "predicted_churn_risk": predicted_risk,
        "risk_reduction": risk_reduction,
        "revenue_saved": revenue_saved,
        "interventions": {
            "discount_pct": discount_pct,
            "support_callback": support_callback,
            "loyalty_bonus": loyalty_bonus,
        },
    }
