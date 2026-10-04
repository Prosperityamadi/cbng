import requests
import json
import uuid

API_BASE = "http://localhost:8000/api"

def test_profile_apis():
    print("Testing Client Profile APIs...")
    
    # 1. Login to get a token
    # We assume a test user exists. Let's create one or login as one.
    email = "test.profile@nemicapbank.com"
    password = "SecurePassword123!"
    
    # Register/Verify logic is heavy, let's just use login if exists
    res = requests.post(f"{API_BASE}/auth/login", json={"email": email, "password": password})
    
    if res.status_code != 200:
        print("Test user not found, please manually insert or register one first. Continuing with a fake token will fail with 401.")
        return
        
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get Profile
    print("\n--- GET /users/me/profile ---")
    res = requests.get(f"{API_BASE}/users/me/profile", headers=headers)
    print("Status:", res.status_code)
    print(json.dumps(res.json(), indent=2))
    
    # 3. Update Profile
    print("\n--- PATCH /users/me/profile ---")
    res = requests.patch(f"{API_BASE}/users/me/profile", headers=headers, json={
        "phone_number": "+12345678900",
        "profile_picture_url": "https://example.com/avatar.jpg"
    })
    print("Status:", res.status_code)
    print(res.json())
    
    # 4. Change Password (Fail Test)
    print("\n--- POST /users/me/security/change-password (Wrong current password) ---")
    res = requests.post(f"{API_BASE}/users/me/security/change-password", headers=headers, json={
        "current_password": "WrongPassword!",
        "new_password": "NewSecurePassword123!"
    })
    print("Status:", res.status_code)
    print(res.json())

if __name__ == "__main__":
    test_profile_apis()
