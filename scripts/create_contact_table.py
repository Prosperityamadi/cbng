from api.database import get_db_cursor

def create_contact_table():
    with get_db_cursor() as cur:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS contact_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'delivered',
            delivery_recipient VARCHAR(255) DEFAULT 'info@nemicapbank.com',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
        CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
        """)
        print("contact_messages table created or verified successfully!")

if __name__ == "__main__":
    create_contact_table()
