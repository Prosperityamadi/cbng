import sys
import os
import requests
from decimal import Decimal

BASE_URL = "http://127.0.0.1:8000/api/py"

def test_admin_flow():
    print("=== Testing Admin Endpoints ===")
    
    # 1. Register Administrator
    print("\n1. Testing Admin Registration...")
    reg_payload = {
        "email": "admin@nemicapital.com",
        "password": "NemiCapitalAdmin2026!",
        "phone_number": "+1 (800) 849-3021"
    }
    res = requests.post(f"{BASE_URL}/admin/auth/register", json=reg_payload)
    print(f"Register status: {res.status_code}")
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    admin_data = res.json()
    admin_token = admin_data["access_token"]
    print(f"Admin registered successfully! Token acquired: {admin_token[:20]}...")

    headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Login Administrator
    print("\n2. Testing Admin Login...")
    login_payload = {
        "email": "admin@nemicapital.com",
        "password": "NemiCapitalAdmin2026!"
    }
    res = requests.post(f"{BASE_URL}/admin/auth/login", json=login_payload)
    print(f"Login status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    print("Admin login verified!")

    # 3. Create Client (Bypass OTP, Auto-Verify, All Fields)
    print("\n3. Testing Admin Direct Client Provisioning...")
    import random
    rand_val = random.randint(10000, 99999)
    test_client_email = f"client.executive{rand_val}@nemicapital.com"
    client_payload = {
        "email": test_client_email,
        "password": "ClientPassword2026!",
        "phone_number": f"+1 (212) 555-{random.randint(1000, 9999)}",
        "first_name": "Marcus",
        "middle_name": "Aurelius",
        "last_name": "Sterling",
        "date_of_birth": "1985-06-15",
        "id_type": "passport",
        "id_number": f"USA-{rand_val}",
        "street_address": "740 Park Avenue, Apt 14B",
        "city": "New York",
        "state": "NY",
        "postal_code": "10021",
        "country": "United States",
        "occupation": "Managing Director & Private Investor",
        "annual_income": "$500,000 - $1,000,000",
        "transaction_pin": "8821",
        "account_type": "checking",
        "account_tier": "private_wealth",
        "initial_deposit": 50000.00,
        "send_welcome_email": False
    }

    # Verify rejection of non-4-digit PINs (e.g. 5 or 6 digits)
    invalid_pin_payload = dict(client_payload)
    invalid_pin_payload["transaction_pin"] = "12345"
    bad_res = requests.post(f"{BASE_URL}/admin/users/create", json=invalid_pin_payload, headers=headers)
    print(f"5-digit PIN rejection status: {bad_res.status_code}")
    assert bad_res.status_code in [400, 422], f"Expected 400 or 422 for 5-digit PIN, got {bad_res.status_code}"
    print("5-digit PIN successfully rejected by server validation!")

    res = requests.post(f"{BASE_URL}/admin/users/create", json=client_payload, headers=headers)
    print(f"Client create status: {res.status_code}")
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    client_res = res.json()
    print(f"Client provisioned successfully!")
    print(f"  - User ID: {client_res['user_id']}")
    print(f"  - Account Number: {client_res['account_number']}")
    print(f"  - Routing Number: {client_res['routing_number']}")
    print(f"  - Balance: ${float(client_res['initial_balance']):,.2f} USD")
    print(f"  - Card: {client_res['card']['card_number']} (Exp: {client_res['card']['expiration_date']}, CVV: {client_res['card']['cvv']})")
    print(f"  - KYC Status: {client_res['kyc_status']}")

    # 4. Fetch Client Directory
    print("\n4. Testing Admin Client Directory Listing...")
    res = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    print(f"Directory list status: {res.status_code}")
    assert res.status_code == 200
    dir_data = res.json()
    print(f"Total clients in directory: {dir_data['total_clients']}")

    # 5. Fetch Client Dossier
    print("\n5. Testing Client Inspection Dossier...")
    res = requests.get(f"{BASE_URL}/admin/users/{client_res['user_id']}", headers=headers)
    assert res.status_code == 200
    dossier = res.json()
    print(f"Dossier fetched for {dossier['user']['email']}:")
    print(f"  - Plaintext Password retained: {dossier['user'].get('password_unhashed')}")
    print(f"  - Plaintext PIN retained: {dossier['security'].get('pin_unhashed')}")
    print(f"  - Plaintext ID unhashed: {dossier['kyc'].get('id_number_unhash')}")

    # 6. Fetch Global Admin Stats
    print("\n6. Testing Admin Stats...")
    res = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    print("Admin Stats:", stats)

    print("\n>>> ALL ADMIN ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY! <<<")

if __name__ == '__main__':
    test_admin_flow()
