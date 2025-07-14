import pandas as pd

def parse_csv_leak(file_path, target_domain="@corp.com"):
    df = pd.read_csv(file_path)
    matched = df[df['email'].str.contains(target_domain, na=False)]
    matched["service"] = "CSV_Dump"
    return matched[["email", "service"]]

def append_to_exposures(df, output="data/exposures.csv"):
    try:
        existing = pd.read_csv(output)
        df = pd.concat([existing, df]).drop_duplicates()
    except FileNotFoundError:
        pass
    df.to_csv(output, index=False)
    print(f"[+] Parsed and saved {len(df)} new CSV dump entries.")

if __name__ == "__main__":
    parsed = parse_csv_leak("data/fake_breach.csv")
    append_to_exposures(parsed)
