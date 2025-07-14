import pandas as pd
from sklearn.preprocessing import LabelEncoder

def preprocess(user_file="data/users.csv"):
    """
    Preprocess the user behavior dataset for ShadowLink ML models.

    Returns:
        X (DataFrame): Features for training
        y_exposed (Series): Labels for exposure prediction
        y_malicious (Series): Labels for fraud detection
    """
    # Load dataset
    df = pd.read_csv(user_file)

    # Encode job role into numeric values
    le = LabelEncoder()
    df["role_encoded"] = le.fit_transform(df["role"])

    # Drop non-feature columns
    df = df.drop(columns=["role", "email"])

    # Features (X) = all but the labels
    X = df.drop(columns=["exposed", "malicious"])

    # Labels
    y_exposed = df["exposed"]
    y_malicious = df["malicious"]

    return X, y_exposed, y_malicious

# To test it 
if __name__ == "__main__":
    X, y_exp, y_mal = preprocess()
    print("[+] Features preview:")
    print(X.head())
