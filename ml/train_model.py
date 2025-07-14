import sys
import os
sys.path.append(os.path.abspath("."))  # Adds root dir to Python path
from ml.preprocess import preprocess
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib 
 
print("[+] Preprocessing data...")
X, y_exposed, y_malicious = preprocess()

# Split for both targets
X_train_exp, X_test_exp, y_train_exp, y_test_exp = train_test_split(X, y_exposed, test_size=0.2, random_state=42)
X_train_mal, X_test_mal, y_train_mal, y_test_mal = train_test_split(X, y_malicious, test_size=0.2, random_state=42)


# Model 1: Exposure Predictions 

print("[+] Training Exposure Model...")
exposure_model = LogisticRegression(max_iter=1000)
exposure_model.fit(X_train_exp, y_train_exp)

exp_preds = exposure_model.predict(X_test_exp)
print("\n[Exposure Prediction Results]")
print(classification_report(y_test_exp, exp_preds))

joblib.dump(exposure_model, "ml/exposure_model.joblib")


#  Model 2: Fraud Prediction for the ML 
 
print("[+] Training Fraud Detection Model...")
fraud_model = RandomForestClassifier(n_estimators=100)
fraud_model.fit(X_train_mal, y_train_mal)

fraud_preds = fraud_model.predict(X_test_mal)
print("\n[Malicious Behavior Detection Results]")
print(classification_report(y_test_mal, fraud_preds))

joblib.dump(fraud_model, "ml/fraud_model.joblib")

print("[+] Models saved!")

#so we have got two different models