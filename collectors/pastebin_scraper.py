#Finds leaked dumps with corporate emails
import re
import pandas as pd

def extract_emails_from_dump(file_path, target_domain="@corp.com"):
    found = []

    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    for line in lines:
        match = re.search(r'([\w\.-]+@[\w\.-]+)', line)
        if match:
            email = match.group(1)
            if target_domain in email:
                found.append(email)

    return list(set(found))  # remove duplicates

def save_results(emails, output="data/exposures.csv"):
    data = [{"email": email, "service": "Pastebin"} for email in emails]
    df = pd.DataFrame(data)
    
    try:
        existing = pd.read_csv(output)
        df = pd.concat([existing, df]).drop_duplicates()
    except FileNotFoundError:
        pass

    df.to_csv(output, index=False)
    print(f"[+] Found {len(data)} Pastebin leaks. Appended to {output}")

if __name__ == "__main__":
    emails = extract_emails_from_dump("data/mock_pastebin_dump.txt")
    save_results(emails)
