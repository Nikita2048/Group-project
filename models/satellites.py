"""Модель спутников."""
from config.database import get_db
from models.base import row_to_dict


def get_all_satellites():
    """Получить все спутники."""
    conn = get_db()
    rows = conn.execute('SELECT * FROM satellites ORDER BY id').fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows], 200


def get_moon():
    """Получить информацию о Луне."""
    conn = get_db()
    row = conn.execute("SELECT * FROM satellites WHERE name = 'Луна'").fetchone()
    conn.close()
    if row is None:
        return {
            'name': 'Луна', 'type': 'Спутник',
            'diameter': '3 475 км', 'mass': '7.35 × 10²² кг',
            'distance': '384 400 км',
            'description': 'Естественный спутник Земли.'
        }, 200
    return row_to_dict(row), 200
