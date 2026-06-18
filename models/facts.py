"""Модель фактов."""
from config.database import get_db
from models.base import row_to_dict


def get_all_facts():
    """Получить все факты."""
    conn = get_db()
    rows = conn.execute('SELECT * FROM facts ORDER BY id').fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows], 200


def get_fact_by_n(n):
    """Получить факт по номеру + инкремент просмотров."""
    conn = get_db()
    row = conn.execute('SELECT * FROM facts WHERE n = ?', (n,)).fetchone()
    if row:
        conn.execute('UPDATE facts SET views = views + 1 WHERE n = ?', (n,))
        conn.commit()
    conn.close()
    if row is None:
        return None, 404
    return row_to_dict(row), 200


def view_fact(n):
    """Только увеличить счётчик просмотров."""
    conn = get_db()
    conn.execute('UPDATE facts SET views = views + 1 WHERE n = ?', (n,))
    conn.commit()
    conn.close()
    return {'ok': True}, 200


def get_random_facts():
    """Получить все случайные факты."""
    conn = get_db()
    rows = conn.execute('SELECT * FROM random_facts').fetchall()
    conn.close()
    return [dict(r) for r in rows], 200


def get_random_fact():
    """Получить один случайный факт."""
    conn = get_db()
    row = conn.execute('SELECT * FROM random_facts ORDER BY RANDOM() LIMIT 1').fetchone()
    conn.close()
    if row is None:
        return None, 404
    return dict(row), 200
