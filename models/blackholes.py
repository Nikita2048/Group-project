"""Модель чёрных дыр."""
from config.database import get_db
from models.base import row_to_dict


def get_blackholes():
    """Получить все чёрные дыры + типы."""
    conn = get_db()
    rows = conn.execute('SELECT * FROM blackholes ORDER BY id').fetchall()
    bh_types = conn.execute('SELECT * FROM bh_types ORDER BY id').fetchall()
    conn.close()
    return {
        'blackholes': [row_to_dict(r) for r in rows],
        'types': [row_to_dict(r) for r in bh_types]
    }, 200
