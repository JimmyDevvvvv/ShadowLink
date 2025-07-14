# ml/risk_engine.py

import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder

class RiskEngine:
    def __init__(self, allowed_roles=None):
        self.exposure_model = joblib.load("ml/exposure_model.joblib")
        self.fraud_model = joblib.load("ml/fraud_model.joblib")
        self.role_encoder = LabelEncoder()
        self.allowed_roles = allowed_roles or ["DevOps", "HR", "IT", "Finance", "Sales", "Marketing"]
        self.role_encoder.fit(self.allowed_roles)

    def prepare_input(self, df):
        df = df.copy()
        df["role_encoded"] = self.role_encoder.transform(df["role"])
        return df[[
            "reused_password", "mfa_enabled", "login_time_variance",
            "geo_login_count", "cloud_downloads_last_week",
            "password_changes_last_90d", "role_encoded"
        ]]

    def evaluate_users(self, df):
        X = self.prepare_input(df)
        exposure_preds = self.exposure_model.predict(X)
        fraud_preds = self.fraud_model.predict(X)

        df["exposure_risk"] = exposure_preds
        df["fraud_flagged"] = fraud_preds
        df["combined_score"] = 0.6 * df["exposure_risk"] + 0.4 * df["fraud_flagged"]

        return df[["email", "role", "exposure_risk", "fraud_flagged", "combined_score"]]
