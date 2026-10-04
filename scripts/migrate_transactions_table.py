import sys
import os

# Add workspace root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.database import get_db_cursor

def run_migration():
    print("Running migration for transactions table...")
    with get_db_cursor() as cur:
        # 1. Add missing columns if they do not exist
        cur.execute("""
            ALTER TABLE transactions 
                ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                ADD COLUMN IF NOT EXISTS counterparty_name VARCHAR(255),
                ADD COLUMN IF NOT EXISTS counterparty_account VARCHAR(100),
                ADD COLUMN IF NOT EXISTS reference_number VARCHAR(60),
                ADD COLUMN IF NOT EXISTS fee NUMERIC(10, 2) DEFAULT 0.00,
                ADD COLUMN IF NOT EXISTS balance_after NUMERIC(15, 2);
        """)
        
        # 2. Add unique constraint on reference_number if not already present
        cur.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'uq_transactions_reference_number'
                ) THEN
                    ALTER TABLE transactions ADD CONSTRAINT uq_transactions_reference_number UNIQUE (reference_number);
                END IF;
            END $$;
        """)

        # 3. Create indices for fast dashboard lookups
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_transactions_account_created 
                ON transactions(account_id, created_at DESC);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_transactions_user_created 
                ON transactions(user_id, created_at DESC);
        """)

        # 4. Populate user_id on any existing transactions from their account_id
        cur.execute("""
            UPDATE transactions t
            SET user_id = a.user_id
            FROM accounts a
            WHERE t.account_id = a.id AND t.user_id IS NULL;
        """)

        print("Migration executed successfully!")

        # Verify columns
        cur.execute("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            ORDER BY ordinal_position;
        """)
        cols = cur.fetchall()
        print("\nUpdated transactions columns:")
        for c in cols:
            print(f"  - {c['column_name']} ({c['data_type']}) nullable={c['is_nullable']}")

if __name__ == '__main__':
    run_migration()
