"""
End-to-End Integration Test for NemiCapital Bank Auth & Onboarding Pipeline.
Tests:
1. Health & Status Check
2. Register Intent (Step 1)
3. Redis OTP Retrieval & Verification (Step 2)
4. KYC Profile Submission (Step 3)
5. Security PIN & Account Provisioning (Step 4)
6. Login with Password
7. Fetching Primary Account & Profile Context
"""
import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from api.index import app
from api.services.redis_service import get_redis_client

client = TestClient(app)

TEST_EMAIL = "sarah.jenkins.e2e@nemicapbank.com"
TEST_PHONE = "+12125550199"
TEST_PASSWORD = "NemiWealthSecurePassword2026!"
TEST_PIN = "4819"


def run_test():
    print("=" * 70)
    print(" NEMICAPITAL BANK - E2E AUTH & ONBOARDING PIPELINE TEST")
    print("=" * 70)

    # 1. Health Check
    print("\n[1/6] Testing /api/py/health...")
    resp = client.get("/api/py/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"
    health_data = resp.json()
    print(f"      Status: {health_data['status']}, Database: {health_data['database']['status']}, Cache: {health_data['cache']['status']}")
    assert health_data["ready"] is True, "System is not ready"

    # 2. Register Intent (Step 1)
    print("\n[2/6] Step 1: Register Intent...")
    resp = client.post(
        "/api/py/auth/register-intent",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "phone_number": TEST_PHONE,
            "terms_accepted": True,
            "privacy_policy_accepted": True
        }
    )
    assert resp.status_code == 201, f"Register intent failed: {resp.text}"
    step1_data = resp.json()
    print(f"      [OK] User registered: {step1_data['email']}, status: {step1_data['status']}")

    # 3. Retrieve OTP from Redis and Verify (Step 2)
    print("\n[3/6] Step 2: Verify OTP from Redis...")
    r = get_redis_client()
    redis_key = f"otp:email:{TEST_EMAIL.lower()}"
    cached_otp = r.get(redis_key)
    print(f"      Fetched cached OTP from Upstash Redis: {cached_otp}")
    assert cached_otp is not None, "OTP was not cached in Redis"

    resp = client.post(
        "/api/py/auth/verify-otp",
        json={
            "email": TEST_EMAIL,
            "otp_code": cached_otp
        }
    )
    assert resp.status_code == 200, f"Verify OTP failed: {resp.text}"
    step2_data = resp.json()
    onboarding_token = step2_data["onboarding_token"]
    print(f"      [OK] OTP verified! Next step: {step2_data['next_step']}")
    print(f"      Onboarding Token: {onboarding_token[:25]}...")

    # 4. KYC Profile Submission (Step 3)
    print("\n[4/6] Step 3: Submit Institutional KYC Profile...")
    headers = {"Authorization": f"Bearer {onboarding_token}"}
    resp = client.post(
        "/api/py/kyc/submit",
        headers=headers,
        json={
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "middle_name": "Marie",
            "date_of_birth": "1992-08-24",
            "id_type": "passport",
            "id_number": "P84920194",
            "street_address": "742 Evergreen Terrace",
            "city": "New York",
            "state": "NY",
            "postal_code": "10001",
            "country": "USA",
            "occupation": "Managing Director",
            "annual_income": "$250,000+",
            "profile_picture_url": "https://djwhjzvszeypetdxvyhk.supabase.co/storage/v1/object/public/profile-pictures/demo_avatar.png"
        }
    )
    assert resp.status_code == 200, f"KYC submission failed: {resp.text}"
    step3_data = resp.json()
    print(f"      [OK] KYC submitted! Status: {step3_data['status']}, Next step: {step3_data['next_step']}")

    # 5. Security PIN & Account Provisioning (Step 4)
    print("\n[5/6] Step 4: Setup Transaction PIN & Provision Account...")
    resp = client.post(
        "/api/py/accounts/setup",
        headers=headers,
        json={
            "account_type": "checking",
            "transaction_pin": TEST_PIN
        }
    )
    assert resp.status_code == 201, f"Account setup failed: {resp.text}"
    step4_data = resp.json()
    account = step4_data["account"]
    access_token = step4_data["access_token"]
    print(f"      [OK] Account Provisioned!")
    print(f"           Account Number: {account['account_number']}")
    print(f"           Routing Number: {account['routing_number']}")
    print(f"           Currency      : {account['currency']}")
    print(f"           Tier          : {account['tier']}")
    print(f"           Access Token  : {access_token[:25]}...")

    # 6. Test Login & Profile Fetching
    print("\n[6/6] Testing Login & Full Authenticated Session...")
    resp = client.post(
        "/api/py/auth/login",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    login_data = resp.json()
    print(f"      [OK] Login successful! Status: {login_data['status']}")

    # Fetch /api/py/auth/me
    auth_headers = {"Authorization": f"Bearer {login_data['access_token']}"}
    resp = client.get("/api/py/auth/me", headers=auth_headers)
    assert resp.status_code == 200, f"Get me failed: {resp.text}"
    me_data = resp.json()
    print(f"      [OK] User Context: {me_data['user']['email']}, Role: {me_data['user']['role']}")
    print(f"           Primary Account: {me_data['primary_account']['account_number']}, Balance: ${me_data['primary_account']['balance']}")
    print(f"           KYC Legal Name : {me_data['kyc']['first_name']} {me_data['kyc']['last_name']}")

    print("\n" + "=" * 70)
    print(" ALL 6 STAGES OF THE AUTH & ONBOARDING PIPELINE PASSED 100%!")
    print("=" * 70)


if __name__ == "__main__":
    run_test()
