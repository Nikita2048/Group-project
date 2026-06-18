"""Модель Солнца."""
from config.database import get_db
from models.base import row_to_dict


def get_sun():
    """Получить информацию о Солнце."""
    conn = get_db()
    row = conn.execute('SELECT * FROM sun WHERE id = 1').fetchone()
    conn.close()
    if row is None:
        return None, 404
    return row_to_dict(row), 200
