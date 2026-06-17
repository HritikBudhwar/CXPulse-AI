"""Customer Health Score Engine — converts multi-channel behaviour into 0–100 score."""

import numpy as np
import pandas as pd


def _normalize(series: pd.Series, higher_is_better: bool = True) -> pd.Series:
    min_v, max_v = series.min(), series.max()
    if max_v == min_v:
        return pd.Series(0.5, index=series.index)
    norm = (series - min_v) / (max_v - min_v)
    return norm if higher_is_better else 1 - norm


def compute_health_score(df: pd.DataFrame) -> pd.Series:
    """Return health scores (0–100) for each customer row."""
    engagement = (
        _normalize(df["website_sessions"]) * 0.3
        + _normalize(df["avg_session_duration"]) * 0.2
        + _normalize(df["pages_visited"]) * 0.1
        + _normalize(df["days_since_last_visit"], higher_is_better=False) * 0.4
    )

    email = (
        _normalize(df["email_open_rate"]) * 0.5
        + _normalize(df["email_click_rate"]) * 0.3
        + (1 - df["unsubscribe_flag"]) * 0.2
    )

    support = (
        _normalize(df["sentiment_score"]) * 0.4
        + _normalize(df["csat_score"]) * 0.3
        + _normalize(df["support_tickets"], higher_is_better=False) * 0.15
        + _normalize(df["avg_resolution_time"], higher_is_better=False) * 0.15
    )

    purchase = (
        _normalize(df["orders_count"]) * 0.25
        + _normalize(df["total_spent"]) * 0.25
        + _normalize(df["average_order_value"]) * 0.2
        + _normalize(df["days_since_last_purchase"], higher_is_better=False) * 0.3
    )

    composite = engagement * 0.25 + email * 0.2 + support * 0.25 + purchase * 0.3
    return (composite * 100).round(1)


def health_category(score: float) -> str:
    if score >= 70:
        return "Healthy"
    if score >= 40:
        return "Needs Attention"
    return "At Risk"


def add_health_scores(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()
    result["health_score"] = compute_health_score(result)
    result["health_category"] = result["health_score"].apply(health_category)
    return result
