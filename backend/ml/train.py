"""Train Random Forest churn prediction model."""

import json
import os
import pickle

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

from health_score import add_health_scores

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "customers.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "churn_model.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "model_metrics.json")

FEATURE_COLS = [
    "website_sessions",
    "avg_session_duration",
    "pages_visited",
    "days_since_last_visit",
    "emails_sent",
    "emails_opened",
    "email_open_rate",
    "email_click_rate",
    "unsubscribe_flag",
    "support_tickets",
    "avg_resolution_time",
    "sentiment_score",
    "csat_score",
    "orders_count",
    "total_spent",
    "average_order_value",
    "days_since_last_purchase",
]


def train() -> dict:
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURE_COLS]
    y = df["churn"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=160,
        max_depth=10,
        min_samples_leaf=5,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred) * 100, 1),
        "precision": round(precision_score(y_test, y_pred, zero_division=0) * 100, 1),
        "recall": round(recall_score(y_test, y_pred, zero_division=0) * 100, 1),
        "f1_score": round(f1_score(y_test, y_pred, zero_division=0) * 100, 1),
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"model": model, "features": FEATURE_COLS}, f)

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("Model trained successfully.")
    for k, v in metrics.items():
        print(f"  {k}: {v}%")
    return metrics


if __name__ == "__main__":
    train()
