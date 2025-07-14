# ml/predict.py

import sys
import os
sys.path.append(os.path.abspath("."))  # Add project root to import path

import pandas as pd
import argparse
from ml.risk_engine import RiskEngine

def main():
    parser = argparse.ArgumentParser(description="Run ShadowLink predictions.")
    parser.add_argument("--input", type=str, default="data/users.csv", help="Path to input user data CSV")
    parser.add_argument("--output", type=str, default="reports/risk_report.csv", help="Path to save output risk report")
    parser.add_argument("--roles", nargs="+", default=["DevOps", "HR", "IT", "Finance", "Sales", "Marketing"], help="List of known roles")
    
    args = parser.parse_args()

    print("\n🧠 ShadowLink Risk Report")
    print("--------------------------")

    df = pd.read_csv(args.input)

    engine = RiskEngine(allowed_roles=args.roles)
    results_df = engine.evaluate_users(df)

    print(results_df)
    results_df.to_csv(args.output, index=False)
    print(f"\n[+] Report saved to {args.output}")

if __name__ == "__main__":
    main()
