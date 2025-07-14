import os
import pandas as pd
from dotenv import load_dotenv
from time import sleep

load_dotenv()
ENV = os.getenv("ENV", "dev")  # default to dev

def check_email(email):
    if ENV == "prod":
        import requests
        API_KEY = os.getenv("HIBP_API_KEY")
        headers = {
            "hibp-api-key": API_KEY,
            "user-agent": "ShadowLinkScanner"
        }
        url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
        r = requests.get(url, headers=headers, params={"truncateResponse": False})
        if r.status_code == 200:
            return [breach["Name"] for breach in r.json()]
        elif r.status_code == 404:
            return []
        else:
            print(f"[!] Error {r.status_code} for {email}")
            return None
    else:
        # Simulated results for development
        print(f"[SIMULATED] Checking {email}")
        if "alice" in email:
            return ["GitHub", "Adobe"]
        if "carol" in email:
            return ["Dropbox"]
        return []

def scan_emails(csv_path="data/users.csv", output_path="data/exposures.csv"):
    df = pd.read_csv(csv_path)
    breaches = []

    for _, row in df.iterrows():
        email = row["email"]
        result = check_email(email)
        if result is not None:
            for service in result:
                breaches.append({"email": email, "service": service})
        sleep(1.5 if ENV == "prod" else 0.2)

    pd.DataFrame(breaches).to_csv(output_path, index=False)
    print(f"[+] Exposures saved to {output_path} [{ENV.upper()} MODE]")

if __name__ == "__main__":
    scan_emails()
