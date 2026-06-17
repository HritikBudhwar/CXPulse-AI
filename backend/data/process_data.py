"""Transform raw customer activity data into the CXPulse schema."""

import os
from datetime import datetime

import numpy as np
import pandas as pd

REFERENCE_DATE = datetime(2025, 6, 17)
RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "synthetic_customer_activity_joined.csv")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "customers.csv")
PROCESSED_PATH = os.path.join(os.path.dirname(__file__), "processed.csv")


def _days_since(date_str: str) -> int:
    try:
        dt = pd.to_datetime(date_str)
        return max(0, (REFERENCE_DATE - dt).days)
    except Exception:
        return 365


def compute_churn(row: pd.Series) -> int:
    score = 0
    if row["days_since_last_purchase"] > 60:
        score += 2
    if row["days_since_last_purchase"] > 90:
        score += 2
    if row["days_since_last_visit"] > 90:
        score += 1
    if row["email_open_rate"] < 0.2:
        score += 1
    if row["sentiment_score"] < 0.4:
        score += 2
    if row["support_tickets"] >= 3:
        score += 1
    if row["website_sessions"] < 10:
        score += 1
    if row["unsubscribe_flag"] == 1:
        score += 2
    return 1 if score >= 5 else 0


def process() -> pd.DataFrame:
    df = pd.read_csv(RAW_PATH)
    rng = np.random.default_rng(42)

    genders = rng.choice(["Male", "Female", "Other"], size=len(df), p=[0.48, 0.48, 0.04])

    processed = pd.DataFrame(
        {
            "customer_id": df["customer_id"],
            "age": df["age"],
            "gender": genders,
            "segment": df["segment"],
            "join_date": df["join_date"],
            "website_sessions": df["sessions"].astype(int),
            "avg_session_duration": np.round(df["time_spent"] / df["sessions"].clip(lower=1), 1),
            "pages_visited": (df["sessions"] * rng.integers(2, 9, size=len(df))).astype(int),
            "days_since_last_visit": df["last_visit"].apply(_days_since),
            "emails_sent": df["emails_sent"].astype(int),
            "emails_opened": df["emails_opened"].astype(int),
            "email_open_rate": np.round(
                df["emails_opened"] / df["emails_sent"].clip(lower=1), 2
            ),
            "email_click_rate": df["click_rate"].astype(float),
            "unsubscribe_flag": 0,
            "support_tickets": df["tickets"].astype(int),
            "avg_resolution_time": np.round(
                rng.uniform(4, 48, size=len(df)) + df["tickets"] * rng.uniform(2, 12, size=len(df)),
                1,
            ),
            "sentiment_score": df["sentiment_score"].astype(float),
            "csat_score": np.round(
                np.clip(df["sentiment_score"] * 5 + rng.normal(0, 0.3, len(df)), 1, 5), 1
            ),
            "orders_count": df["orders"].astype(int),
            "total_spent": df["total_spent"].astype(float),
            "average_order_value": np.round(
                df["total_spent"] / df["orders"].clip(lower=1), 2
            ),
            "days_since_last_purchase": df["last_purchase"].apply(_days_since),
        }
    )

    processed["unsubscribe_flag"] = (
        (processed["email_open_rate"] < 0.1) & (processed["emails_sent"] > 5)
    ).astype(int)

    processed["churn"] = processed.apply(compute_churn, axis=1)
    noise_mask = rng.random(len(processed)) < 0.13
    processed.loc[noise_mask, "churn"] = 1 - processed.loc[noise_mask, "churn"]

    processed.to_csv(OUTPUT_PATH, index=False)
    processed.to_csv(PROCESSED_PATH, index=False)
    print(f"Processed {len(processed)} customers -> {OUTPUT_PATH}")
    print(f"Churn rate: {processed['churn'].mean():.1%}")
    return processed


if __name__ == "__main__":
    process()
