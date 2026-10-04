from api.database import get_db_cursor

with get_db_cursor() as cur:
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    print("Tables:", [r['table_name'] for r in cur.fetchall()])
