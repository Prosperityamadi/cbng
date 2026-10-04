from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool
from api.config import settings

# Thread-safe connection pool
_pool: ThreadedConnectionPool | None = None


def get_connection_pool() -> ThreadedConnectionPool:
    global _pool
    if _pool is None or _pool.closed:
        _pool = ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=settings.DATABASE_URL
        )
    return _pool


@contextmanager
def get_db():
    """
    Context manager yielding a transactional database connection.
    Automatically commits on success or rolls back on exception.
    """
    pool = get_connection_pool()
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)


@contextmanager
def get_db_cursor(commit: bool = True):
    """
    Context manager yielding a RealDictCursor for dictionary-like record access.
    """
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        finally:
            cursor.close()
