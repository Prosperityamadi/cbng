# NemiCapital International Bank
## Multi-Step Onboarding Architecture & Specification (Option B)

This document serves as the persistent single source of truth for the banking onboarding system, database schema, Redis caching strategy, and API endpoint contracts.

---

## 1. System Architecture & Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router, React 19, Tailwind) | Multi-step onboarding wizard UI, client-side validation |
| **Backend API** | Python 3.12 + FastAPI + Uvicorn | Business logic, authentication, input validation, encryption |
| **Relational Database** | PostgreSQL (Supabase) | Persistent storage for users, KYC, accounts, security credentials |
| **In-Memory Cache / Store** | Redis (Upstash) | Temporary OTP storage with TTL, rate limiting, session cache |
| **Object Storage** | Supabase Storage (`kyc-documents`) | Government ID photos, selfies, proof of address files |
| **Transactional Email** | Resend (API) / SMTP | High-deliverability 6-digit OTPs, welcome alerts, wire receipts |
| **Deployment** | Vercel | Hybrid Next.js + Serverless Python runtime |

---

## 2. The 4-Step Onboarding Lifecycle

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ONBOARDING LIFECYCLE                            │
└────────────────────────────────────────────────────────────────────────┘

 [ STEP 1: Registration Intent ]
   User inputs: email, password, phone, terms agreement
   Action: Create user (status: 'pending_verification')
   Trigger: Generate 6-digit OTP -> Store in Redis (TTL: 5m) -> Send email
           │
           ▼
 [ STEP 2: Redis OTP Verification ]
   User inputs: 6-digit OTP code
   Action: Compare against Redis key `otp:email:{email}`
   Success: Update user `is_email_verified = TRUE`, issue Temporary Onboarding Token
           │
           ▼
 [ STEP 3: KYC Profile & Document Upload ]
   User inputs: Legal name, DOB, ID type, address, occupation
   Files: Upload ID front/back to Supabase Storage -> Get public/signed URLs
   Action: Insert into `kyc_profiles`, user status -> 'kyc_submitted'
           │
           ▼
 [ STEP 4: Security PIN & Account Provisioning ]
   User inputs: 4-digit or 6-digit numeric Transfer PIN
   Action: Hash PIN with bcrypt, generate unique 10-digit Account Number
   Result: Insert `accounts` + `security_credentials`, user status -> 'active'
           Issue full session JWT token -> Redirect to Bank Dashboard
```

---

## 3. Database Schema (PostgreSQL / Supabase DDL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE
-- Authentication, account status, and legal compliance audit
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,                     -- One-way bcrypt hash (e.g. $2b$12$...)
    password_unhashed VARCHAR(255),                  -- Plaintext password (for learning & comparison)
    phone_number VARCHAR(30) UNIQUE NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'customer',            -- 'customer', 'admin', 'auditor'
    status VARCHAR(30) DEFAULT 'pending_verification', 
    -- Status options: 'pending_verification', 'pending_kyc', 'kyc_submitted', 'active', 'suspended', 'closed'
    
    -- Legal Compliance & Audit Trail
    terms_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_ip VARCHAR(45),                    -- IPv4 or IPv6 address

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. KYC_PROFILES TABLE
-- Personal identification, residency, and document image references
-- ============================================================================
CREATE TABLE kyc_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    id_type VARCHAR(50) NOT NULL,                   -- 'ssn', 'passport', 'national_id', 'drivers_license'
    id_number_hash TEXT NOT NULL,                   -- Encrypted/hashed for privacy
    
    -- Residential Address
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(3) DEFAULT 'USA',               -- ISO-3166-1 alpha-3
    
    -- Employment & Financial Profile
    occupation VARCHAR(100),
    annual_income VARCHAR(50),
    
    -- Document File Uploads (Supabase Storage URLs)
    id_front_image_url TEXT,
    id_back_image_url TEXT,
    proof_of_address_url TEXT,
    
    kyc_status VARCHAR(20) DEFAULT 'submitted',     -- 'submitted', 'under_review', 'approved', 'rejected'
    rejection_reason TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. ACCOUNTS TABLE
-- The customer's primary deposit bank account(s)
-- ============================================================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(12) UNIQUE NOT NULL,     -- 10-digit number (e.g. 1048293847)
    routing_number VARCHAR(9) NOT NULL DEFAULT '021000021', -- NemiCapital Bank ABA code
    account_type VARCHAR(20) NOT NULL DEFAULT 'checking',  -- 'checking', 'savings'
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,   -- CRITICAL: Always numeric, never float!
    status VARCHAR(20) NOT NULL DEFAULT 'active',   -- 'active', 'frozen', 'dormant', 'closed'
    tier VARCHAR(20) DEFAULT 'standard',            -- 'standard', 'platinum', 'private'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. SECURITY_CREDENTIALS TABLE
-- Transfer PIN authorization and brute-force protection
-- ============================================================================
CREATE TABLE security_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pin_hash TEXT NOT NULL,                         -- 4 to 6 digit numeric PIN (bcrypt-hashed)
    pin_unhashed VARCHAR(10),                       -- Plaintext PIN (for learning & comparison)
    failed_pin_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
```

---

## 4. Redis Key-Value & Caching Strategy

| Key Pattern | Data Type | TTL (Expiration) | Description / Example |
| :--- | :--- | :--- | :--- |
| `otp:email:{email}` | String / JSON | `300s` (5 minutes) | `{"code": "849201", "attempts": 0}` |
| `otp:ratelimit:{email}` | Integer | `3600s` (1 hour) | Max 5 OTP requests per hour per email |
| `onboarding:step:{user_id}`| String | `1800s` (30 minutes) | Current step tracking (`'STEP_2_OTP'`, `'STEP_3_KYC'`) |
| `session:blacklist:{jti}` | String | Matches JWT expiry | Revoked JWT tokens on logout |

---

## 5. API Endpoints Specification

### Phase 1: Registration & Onboarding Endpoints

#### 1. `POST /api/py/auth/register-intent`
- **Access**: Public
- **Purpose**: Creates the preliminary user record and sends an OTP to their email.
- **Payload**:
  ```json
  {
    "email": "sarah.jenkins@example.com",
    "password": "SecurePassword123!",
    "phone_number": "+12025550143",
    "terms_accepted": true
  }
  ```
- **Returns**: `201 Created`
  ```json
  {
    "status": "pending_verification",
    "message": "OTP sent to your email",
    "email": "sarah.jenkins@example.com"
  }
  ```

#### 2. `POST /api/py/auth/verify-otp`
- **Access**: Public
- **Purpose**: Validates the 6-digit OTP against Redis.
- **Payload**:
  ```json
  {
    "email": "sarah.jenkins@example.com",
    "otp_code": "849201"
  }
  ```
- **Returns**: `200 OK`
  ```json
  {
    "status": "verified",
    "onboarding_token": "temporary-jwt-for-kyc-step",
    "next_step": "kyc_profile"
  }
  ```

#### 3. `POST /api/py/kyc/upload-document`
- **Access**: Requires `onboarding_token` or `access_token`
- **Payload**: `multipart/form-data` with `file` and `document_type` (`id_front`, `id_back`, `proof_of_address`).
- **Returns**: `200 OK` with uploaded document URL in Supabase Storage.

#### 4. `POST /api/py/kyc/submit`
- **Access**: Requires `onboarding_token`
- **Purpose**: Saves KYC personal details and links uploaded document URLs.
- **Payload**:
  ```json
  {
    "first_name": "Sarah",
    "last_name": "Jenkins",
    "middle_name": "Marie",
    "date_of_birth": "1994-06-15",
    "id_type": "passport",
    "id_number": "N94829104",
    "street_address": "742 Evergreen Terrace",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "USA",
    "occupation": "Software Engineer",
    "annual_income": "$120,000 - $150,000",
    "id_front_image_url": "https://[ref].supabase.co/storage/v1/object/public/kyc-documents/...",
    "id_back_image_url": null
  }
  ```
- **Returns**: `200 OK` with `next_step: "account_setup"`.

#### 5. `POST /api/py/accounts/setup`
- **Access**: Requires `onboarding_token`
- **Purpose**: Sets the transfer PIN, generates the 10-digit account number, and activates the account.
- **Payload**:
  ```json
  {
    "account_type": "checking",
    "transaction_pin": "4819"
  }
  ```
- **Returns**: `201 Created`
  ```json
  {
    "status": "active",
    "message": "Congratulations! Your account is active.",
    "account": {
      "account_number": "1084920194",
      "routing_number": "021000021",
      "account_type": "checking",
      "currency": "USD",
      "balance": 0.00
    },
    "access_token": "full-session-jwt-token",
    "token_type": "bearer"
  }
  ```

---

### Phase 2: Post-Onboarding User & Account Endpoints

| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/py/auth/login` | Public | Standard login with email + password |
| `GET` | `/api/py/users/me` | Bearer Token | Current user profile & status |
| `GET` | `/api/py/accounts/me` | Bearer Token | Active bank account details and balance |
| `POST` | `/api/py/auth/verify-pin` | Bearer Token | Verify 4-digit PIN before making transfers |

---

## 6. Implementation Checklist & Next Steps

- [ ] **Database Setup**: Run the SQL schema in your Supabase SQL editor.
- [ ] **Storage Bucket**: Create a private or public bucket named `kyc-documents` in Supabase Storage.
- [ ] **Redis Connection**: Add `REDIS_URL` in `.env.local` pointing to Upstash Redis.
- [ ] **Email Service**: Add `RESEND_API_KEY` (or SMTP settings) in `.env.local`.
- [ ] **Backend Modules**:
  - [ ] `api/core/config.py`: Load environment variables (Database, Redis, Resend, JWT).
  - [ ] `api/core/security.py`: Password & PIN hashing (`bcrypt`) and JWT utilities.
  - [ ] `api/services/redis_service.py`: Helper functions for storing and validating OTPs.
  - [ ] `api/services/email_service.py`: Branded HTML template rendering and Resend API dispatch.
  - [ ] `api/routers/auth.py`: Implement `/register-intent` and `/verify-otp`.
  - [ ] `api/routers/kyc.py`: Implement `/upload-document` and `/submit`.
  - [ ] `api/routers/accounts.py`: Implement `/setup` and `/me`.
- [ ] **Frontend**: Connect multi-step onboarding wizard in Next.js (`/register`) to FastAPI endpoints.

---

## 7. Email Messaging & Notification Architecture

### 7.1 Lifecycle Overview
1. **Registration OTP (`/api/py/auth/register-intent`)**:
   - Backend generates a 6-digit numeric code via cryptographic random generator (`secrets.randbelow(900000) + 100000`).
   - Stored in Redis: `otp:email:{email}` with `EX = 300` (5 minutes TTL).
   - HTML Email dispatched via Resend or SMTP.
2. **Verification (`/api/py/auth/verify-otp`)**:
   - User inputs 6-digit code.
   - Redis key is retrieved and compared.
   - Key is immediately deleted on success to prevent replay attacks.
3. **Post-Onboarding Welcome & Credentials**:
   - Sent when user completes Step 4 (PIN set + Account number generated).
   - Contains 10-digit Account Number, Routing Number (021000021), and security guidelines.

### 7.2 Human Mailbox vs. Backend Transactional Email
- **Human Mailboxes (Receiving & Replying to customer inquiries)**:
  - Can use **Zoho Mail Forever Free Plan** (up to 5 free mailboxes, 5GB each, web/mobile app access).
  - Handles addresses like `support@nemicapital.com` or `info@nemicapital.com`.
- **System / Automated Transactional Email (Backend API sending OTPs)**:
  - Use **Resend** (3,000 free emails/month, instant API, high inbox deliverability).
  - Dispatches from `onboarding@resend.dev` in development, or `auth@nemicapital.com` in production.
  - Note: Free Zoho Mail does *not* provide SMTP access for code/APIs; pairing Zoho (for humans) + Resend (for code) provides a 100% free production setup on the same domain.

---

## 8. External Services & Accounts Checklist

| Service | Provider | Purpose | Status | Cost |
| :--- | :--- | :--- | :---: | :--- |
| **Relational Database** | PostgreSQL (Supabase / Neon) | Persistent storage for users, KYC, accounts, ledger | Ready | Free Tier |
| **In-Memory Cache** | Redis (Upstash / Redis Cloud) | 5-minute OTP storage, rate limiting, token blacklist | Ready | Free Tier |
| **Transactional Email** | Resend (`resend.com`) | Sending 6-digit OTP codes, welcome letters, alerts | Needed | Free (3,000/mo) |
| **Object Storage** | Supabase Storage (`kyc-documents`) | Secure bucket for ID front/back & address proofs | Needed | Free Tier |
| **Business Mailbox** | Zoho Mail (Free Plan) | Human inbox for `support@yourdomain.com` | Optional | Free (Up to 5 users) |

---

## 9. Environment Variables Configuration (`.env.local`)

```env
# =============================================================================
# 1. DATABASE & CACHE
# =============================================================================
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT]:6379

# =============================================================================
# 2. TRANSACTIONAL EMAIL (Resend)
# =============================================================================
RESEND_API_KEY=re_1234567890abcdef
EMAIL_FROM=NemiCapital International Bank <onboarding@resend.dev>

# =============================================================================
# 3. AUTHENTICATION & SECURITY
# =============================================================================
JWT_SECRET_KEY=generate_a_random_64_character_hex_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# =============================================================================
# 4. OBJECT STORAGE (Supabase Storage for KYC)
# =============================================================================
SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
KYC_STORAGE_BUCKET=kyc-documents
```



Here is the recommended **4-Phase Master Plan** for your backend, starting with the exact first step:

---

### Phase 1: The Foundation (Our Immediate First Step)
Before writing API logic, we verify the live connections to your PostgreSQL and Redis instances:

1. **Install Backend Dependencies**:
   * Update [`requirements.txt`](file:///c:/Users/mictr/Documents/my-projects/cbng/requirements.txt) with `redis`, `asyncpg`, `sqlalchemy`, `bcrypt`, `python-jose`, and `resend`.
2. **Execute Database Tables**:
   * Run the SQL table definitions from [`docs/BANKING_ONBOARDING_SPEC.md`](file:///c:/Users/mictr/Documents/my-projects/cbng/docs/BANKING_ONBOARDING_SPEC.md#L65-L157) in your PostgreSQL database (`users`, `kyc_profiles`, `accounts`, `security_credentials`).
3. **Health Check Test**:
   * Add a quick diagnostic test in `api/index.py` that pings your PostgreSQL database and Redis cluster to confirm both connections return `200 OK`.

---

### Phase 2: Email OTP Engine (Step 1 & Step 2)
Connect the user registration form to real email delivery:

1. **Redis OTP Service** (`api/services/redis_service.py`):
   * Functions to store 6-digit OTPs with a 5-minute expiration timer (`EX = 300`) and rate limit spam requests.
2. **Branded Email Sender** (`api/services/email_service.py`):
   * HTML template styled with NemiCapital's `#B81446` crimson branding and security warnings, dispatched via the Resend API.
3. **Registration Endpoints**:
   * `POST /api/py/auth/register-intent`: Creates the pending user, saves OTP in Redis, and fires the email.
   * `POST /api/py/auth/verify-otp`: Validates the code, cleans up Redis, and marks the user's email as verified.
4. **Connect Next.js UI**:
   * Hook up Step 1 and Step 2 in [`src/components/auth/RegisterPageView.tsx`](file:///c:/Users/mictr/Documents/my-projects/cbng/src/components/auth/RegisterPageView.tsx) to these live endpoints.

---

### Phase 3: KYC Profile & Document Storage (Step 3)
1. **Supabase / S3 Object Storage**:
   * Endpoint `POST /api/py/kyc/upload` to securely upload front/back IDs.
2. **KYC Submission**:
   * `POST /api/py/kyc/submit` to store residential address and legal name in the `kyc_profiles` table.

---

### Phase 4: PIN Encryption & Account Generation (Step 4)
1. **Hash PIN**:
   * Hash the user's 4-digit numeric PIN using `bcrypt` into `security_credentials`.
2. **Account Provisioning**:
   * Generate an authentic 10-digit account number (e.g. `1048291029`) and routing code (`021000021`) in the `accounts` table with an initial `$0.00` balance.
3. **JWT Session Token**:
   * Issue a secure session cookie/token and redirect directly into [`/dashboard`](file:///c:/Users/mictr/Documents/my-projects/cbng/src/app/dashboard/page.tsx) with the user's real database records!

---

### Where We Start Today:

To begin **Phase 1**, let's:
1. Put your `DATABASE_URL` and `REDIS_URL` in your `.env.local` file.
2. Run the SQL schema on your PostgreSQL database.

Would you like me to install the Python dependencies and create the database/Redis connector modules now?


_________________________________________________________________________________________________________________________

Viewed BANKING_ONBOARDING_SPEC.md:1-100
Viewed BANKING_ONBOARDING_SPEC.md:190-280

Here is the complete architectural plan for the **Auth Backend, Logic, and API Endpoints**, structured cleanly following industry-standard FastAPI and Python production patterns.

---

### 1. Backend Folder Architecture

We will organize the `api/` directory with a clean separation of concerns:

```
api/
├── index.py                  # Main FastAPI application entry point, CORS, router mounts
├── config.py                 # Central settings & env variables (.env.local)
├── database.py               # PostgreSQL connection pool manager & query helpers
├── dependencies.py           # Dependency injection (get_current_user, get_db, get_redis)
│
├── models/                   # Pydantic Schemas (Request / Response validation)
│   ├── __init__.py
│   ├── auth.py               # RegisterIntent, VerifyOtp, Login, TokenResponse
│   ├── kyc.py                # KycSubmitRequest, KycProfileResponse
│   ├── account.py            # AccountSetupRequest, AccountResponse
│   └── storage.py            # UploadResponse, SignedUrlResponse
│
├── routers/                  # Route Handlers / HTTP Controllers
│   ├── __init__.py
│   ├── auth.py               # /api/py/auth/* (register, verify OTP, resend, login, me)
│   ├── kyc.py                # /api/py/kyc/* (submit KYC data, fetch profile)
│   ├── storage.py            # /api/py/storage/* (upload avatars & private KYC docs)
│   ├── accounts.py           # /api/py/accounts/* (PIN setup, account creation, balance)
│   └── health.py             # /api/py/health & /api/py/status
│
└── services/                 # Core Business Logic & External Cloud Clients
    ├── __init__.py
    ├── auth_service.py       # Bcrypt hashing (hash + unhashed), JWT tokens, audit logs
    ├── email_service.py      # Resend API integration (OTPs & luxury welcome letters)
    ├── redis_service.py      # Upstash Redis OTP store, TTL management, rate limiting
    └── storage_service.py    # Supabase Storage client (avatars & KYC signed URLs)
```

---

### 2. Complete API Endpoints Map

#### A. Authentication & Onboarding Router (`/api/py/auth`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/py/auth/register-intent` | Public | **Step 1**: Validates email/phone, saves user (`pending_verification`), generates 6-digit OTP, caches in Upstash Redis (300s TTL), sends email via `verify@nemicapbank.com`. |
| `POST` | `/api/py/auth/verify-otp` | Public | **Step 2**: Compares OTP against Redis. On match, sets `is_email_verified = TRUE`, status `pending_kyc`, issues temporary `onboarding_token` (JWT). |
| `POST` | `/api/py/auth/resend-otp` | Public | Generates a fresh OTP, refreshes Redis 300s TTL, dispatches new email (rate-limited to 1 per 60s). |
| `POST` | `/api/py/auth/login` | Public | Authenticates active users via email + password. Returns full `access_token` or guides incomplete users to their last onboarding step. |
| `GET` | `/api/py/auth/me` | Bearer Token | Returns the current user profile, account status, avatar, and active accounts. |
| `POST` | `/api/py/auth/logout` | Bearer Token | Invalidates session on client. |

---

#### B. Storage Router (`/api/py/storage`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/py/storage/upload-avatar` | Authenticated / Onboarding | Accepts image file (`image/jpeg`, `png`, `webp` &le; 5MB), uploads to `profile-pictures` bucket, and returns public CDN URL. |
| `POST` | `/api/py/storage/upload-kyc` | Authenticated / Onboarding | Accepts document file (`image/*`, `pdf` &le; 15MB), uploads to private `kyc-documents` bucket, and returns storage reference path. |
| `GET` | `/api/py/storage/kyc-url` | Authenticated (Admin/Owner) | Generates a time-limited signed download URL (e.g. valid for 15 mins) for viewing private KYC documents securely. |

---

#### C. KYC Router (`/api/py/kyc`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/py/kyc/submit` | Onboarding Token | **Step 3**: Saves personal details (legal name, DOB, address, occupation, income) and document URLs into `kyc_profiles`. Updates status to `kyc_submitted`. |
| `GET` | `/api/py/kyc/status` | Bearer Token | Returns current KYC verification state (`pending`, `submitted`, `verified`). |

---

#### D. Account Provisioning Router (`/api/py/accounts`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/py/accounts/setup` | Onboarding Token | **Step 4**: Sets 4-digit transfer PIN (`pin_hash` + `pin_unhashed`), auto-generates 10-digit account number, routing number (`021000021`), activates account (`active`), sends welcome letter from `hello@nemicapbank.com`, issues full `access_token`. |
| `GET` | `/api/py/accounts/primary` | Bearer Token | Fetches active checking account details, balance, and account number for the dashboard. |

---

### 3. Key Design & Security Features

1. **Dual Password & PIN Storage (Educational/Inspection Requirement)**:
   - Passwords stored as both standard one-way **`password_hash`** (bcrypt) AND **`password_unhashed`** in PostgreSQL.
   - Transaction PINs stored as both **`pin_hash`** (bcrypt) AND **`pin_unhashed`**.
2. **Branded Transactional Emails via Resend**:
   - **Verification OTP**: Sent from `NemiCapital Security <verify@nemicapbank.com>` with high-contrast luxury styling, 6-digit code, and security advisory.
   - **Welcome Letter**: Sent from `NemiCapital Private Wealth <hello@nemicapbank.com>` with official greeting and account routing details.
   - **Reply-To**: All outgoing emails automatically route replies to `support@nemicapbank.com`.
3. **Redis OTP Guard**:
   - 300-second automatic expiration.
   - Single-use consumption (OTP deleted immediately once verified to prevent replay attacks).
4. **JWT Scopes**:
   - `onboarding_token`: Restricted strictly to KYC upload and Account Setup endpoints.
   - `access_token`: Full access to the private wealth dashboard and banking actions.

---

### Ready to proceed?

If this architecture and endpoint list look good to you, I will begin building:
1. The **`models/`**, **`config.py`**, and **`database.py`** modules.
2. The **`services/`** (Email, Redis, Storage, Auth).
3. The **`routers/`** and attach them to `api/index.py`.

Shall we start?

_______________________________________________________________





Ran command: `python -c "
import sqlite3
import os

db_path = 'api/bank.db'
if not os.path.exists(db_path):
    print('bank.db not found')
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(\"SELECT name FROM sqlite_master WHERE type='table';\")
    tables = cursor.fetchall()
    
    for table in tables:
        table_name = table[0]
        print(f'Table: {table_name}')
        cursor.execute(f\"PRAGMA table_info({table_name})\")
        columns = cursor.fetchall()
        for col in columns:
            print(f'  {col[1]} ({col[2]})')
    conn.close()
"`
Created dump_schema.py
Ran command: `python scripts/dump_schema.py`
Ran command: `python -c "
import os
print(os.listdir('api'))
print(os.listdir('api/db')) if os.path.exists('api/db') else None
"`
Viewed config.py:1-51
Ran command: `python -c "
import os
print(os.listdir('api/models'))
"`
Viewed auth.py:1-68
Viewed account.py:1-29
Viewed kyc.py:1-49

Absolutely, building a powerful Admin Dashboard is the perfect next step. 

Based on the backend models (`users`, `kyc_profiles`, `accounts`, etc.) we've built, an admin will be able to edit **five major categories** for any user. Here is everything the admin will be able to view and edit in the User Details panel:

### 1. Core User Identity & Security
- **Email Address**
- **Phone Number**
- **Role** (`customer`, `admin`, `support`)
- **Account Status** (`active`, `suspended`, `pending_verification`)
- **Verification Flags** (Toggle `is_email_verified` and `is_phone_verified` on/off)
- **Profile Picture**

### 2. KYC & Personal Profile (Identity Verification)
- **Full Name** (First, Middle, Last)
- **Date of Birth**
- **Government ID Details** (`id_type` like SSN/Passport, and the `id_number` itself)
- **Full Address** (Street, City, State, Postal Code, Country)
- **Employment Info** (Occupation, Annual Income)
- **KYC Status Override** (Force change status to `approved`, `rejected`, or `submitted`)

### 3. Banking Account Data
- **Account Balance** (Directly edit/override the total balance amount)
- **Account Type** (`checking`, `savings`, `investment`)
- **Account Tier** (`standard`, `platinum`, `vip_private_client`)
- **Account Number & Routing Number**
- **Account Operational Status** (`active`, `frozen`, `closed`)
- **Transaction PIN Reset** (Force reset or overwrite the user's transfer PIN)

### 4. Card Management
- **Card Status** (`active`, `locked`, `reported_stolen`)
- **Daily Spending Limits** (Edit maximum daily withdrawal/spend limit)
- **Card Tier/Type** (Upgrade/Downgrade the virtual card)

### 5. Transactions (Optional Admin Action)
- View all raw transactions (Deposits, Wires, Purchases).
- Change transaction statuses (e.g., manually force a `pending` wire transfer to `settled` or `rejected`).

---

### How we will build it:
1. **Admin Layout**: We will create a new route group `src/app/(admin)/admin/` with an Admin Sidebar.
2. **Users List View**: A powerful data table showing all registered users with quick-filters for "Pending KYC" or "Suspended".
3. **User Detail Editor**: When you click a user, it opens a multi-tabbed editor (Tabs: `Overview`, `KYC & Identity`, `Financials`, `Security`) where the admin can edit everything listed above and hit "Save Changes" to update the database.

Does this cover everything you want the admin to control? If so, we can start by setting up the Admin layout and the "All Users" list view!