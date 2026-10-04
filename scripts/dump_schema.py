import sqlite3
import os

db_path = 'api/bank.db'
if not os.path.exists(db_path):
    print('bank.db not found')
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    for table in tables:
        table_name = table[0]
        print(f'\n=== Table: {table_name} ===')
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        for col in columns:
            print(f'  {col[1]} ({col[2]})')
    conn.close()
