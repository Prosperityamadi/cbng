"""
Local PostgreSQL and Redis Verification Script for NemiCapital Bank.
Tests connectivity, provisions database schema, and validates data operations.
"""
import os
import sys
import redis
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from dotenv import load_dotenv

# Load local environment
load_dotenv('.env.local')

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/nemicapital_bank')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

SCHEMA_SQL = """
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_unhashed VARCHAR(255),
    phone_number VARCHAR(30) UNIQUE NOT NULL,
    profile_picture_url TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'customer',
    status VARCHAR(30) DEFAULT 'pending_verification',
    terms_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    registration_ip VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. KYC_PROFILES TABLE
CREATE TABLE IF NOT EXISTS kyc_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    id_number_hash TEXT NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(3) DEFAULT 'USA',
    occupation VARCHAR(100),
    annual_income VARCHAR(50),
    profile_picture_url TEXT,
    id_front_image_url TEXT,
    id_back_image_url TEXT,
    proof_of_address_url TEXT,
    kyc_status VARCHAR(20) DEFAULT 'submitted',
    rejection_reason TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 4. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(12) UNIQUE NOT NULL,
    routing_number VARCHAR(9) NOT NULL DEFAULT '021000021',
    account_type VARCHAR(20) NOT NULL DEFAULT 'checking',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    tier VARCHAR(20) DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SECURITY_CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS security_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pin_hash TEXT NOT NULL,
    pin_unhashed VARCHAR(10),
    failed_pin_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
"""


def test_redis():
    print("[1/3] Testing Local Redis Connection...")
    try:
        r = redis.from_url(REDIS_URL, decode_responses=True)
        assert r.ping() is True, "Redis ping failed"
        
        # Test OTP store with 300s TTL
        test_key = "otp:email:test.client@nemicapital.com"
        r.set(test_key, "849201", ex=300)
        cached_otp = r.get(test_key)
        ttl = r.ttl(test_key)
        
        assert cached_otp == "849201", f"Expected '849201', got '{cached_otp}'"
        assert ttl > 0, f"Expected TTL > 0, got {ttl}"
        
        # Cleanup
        r.delete(test_key)
        print(f"      [OK] Redis is LIVE! (Ping: PONG, Set/Get OK, TTL: {ttl}s verified)")
        return True
    except Exception as e:
        print(f"      [FAIL] Redis error: {e}")
        return False


def test_postgres_and_migrate():
    print("\n[2/3] Testing Local PostgreSQL & Running Schema Migrations...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Execute Schema
        cur.execute(SCHEMA_SQL)
        
        # Verify created tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row['table_name'] for row in cur.fetchall()]
        print(f"      [OK] PostgreSQL Schema deployed successfully!")
        print(f"      [OK] Created Tables: {', '.join(tables)}")
        
        # Verify columns in users table (specifically password_hash and password_unhashed)
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('password_hash', 'password_unhashed');
        """)
        user_pwd_cols = {row['column_name']: row['data_type'] for row in cur.fetchall()}
        assert 'password_hash' in user_pwd_cols, "Missing password_hash column"
        assert 'password_unhashed' in user_pwd_cols, "Missing password_unhashed column"
        print(f"      [OK] Confirmed columns in 'users' table: password_hash ({user_pwd_cols['password_hash']}) and password_unhashed ({user_pwd_cols['password_unhashed']})")
        
        # 3. Test insert with hashed and unhashed password
        print("\n[3/3] Testing User Creation with Hashed vs Unhashed Password...")
        test_email = "sarah.jenkins@nemicapital.com"
        test_password_plain = "NemiPrivateWealth2026!"
        
        # Hash using bcrypt
        salt = bcrypt.gensalt(12)
        pwd_hash = bcrypt.hashpw(test_password_plain.encode('utf-8'), salt).decode('utf-8')
        
        # Clean existing test user if any
        cur.execute("DELETE FROM users WHERE email = %s;", (test_email,))
        
        cur.execute("""
            INSERT INTO users (
                email, 
                password_hash, 
                password_unhashed, 
                phone_number, 
                is_email_verified, 
                status
            ) VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, email, password_unhashed, password_hash;
        """, (
            test_email,
            pwd_hash,
            test_password_plain,
            "+12025550199",
            True,
            "active"
        ))
        user_row = cur.fetchone()
        
        print(f"      [OK] Inserted User ID: {user_row['id']}")
        print(f"      [OK] Plaintext (password_unhashed) : {user_row['password_unhashed']}")
        print(f"      [OK] Bcrypt Hash (password_hash)   : {user_row['password_hash']}")
        
        # Verify password matches using bcrypt
        is_valid = bcrypt.checkpw(test_password_plain.encode('utf-8'), user_row['password_hash'].encode('utf-8'))
        assert is_valid is True, "Bcrypt verification failed!"
        print(f"      [OK] Bcrypt Verification Check      : MATCH (True)")
        
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"      [FAIL] PostgreSQL error: {e}")
        return False


if __name__ == '__main__':
    print("=" * 70)
    print(" NEMICAPITAL BANK - LOCAL INFRASTRUCTURE VERIFICATION")
    print("=" * 70)
    
    redis_ok = test_redis()
    pg_ok = test_postgres_and_migrate()
    
    print("\n" + "=" * 70)
    if redis_ok and pg_ok:
        print(" ALL LOCAL SERVICES ARE HEALTHY, CONNECTED, AND READY FOR USE!")
    else:
        print(" ONE OR MORE SERVICES FAILED VERIFICATION. REVIEW LOGS ABOVE.")
    print("=" * 70)
