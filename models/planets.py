"""Модель планет."""
from config.database import get_db
from models.base import row_to_dict


def get_all_planets():
    """Получить все планеты."""
    conn = get_db()
    rows = conn.execute('SELECT * FROM planets ORDER BY dist').fetchall()
    conn.close()
    planets = []
    for r in rows:
        p = row_to_dict(r)
        p['hasRing'] = bool(p.get('hasRing', 0))
        planets.append(p)
    return planets, 200


def get_planet_by_name(name):
    """Получить планету по имени."""
    conn = get_db()
    row = conn.execute('SELECT * FROM planets WHERE name = ?', (name,)).fetchone()
    conn.close()
    if row is None:
        return None, 404
    p = row_to_dict(row)
    p['hasRing'] = bool(p.get('hasRing', 0))
    return p, 200


def create_planet(data):
    """Создать новую планету (админка)."""
    conn = get_db()
    try:
        conn.execute('''INSERT INTO planets (name, emoji, color, glow, tag, tagColor, dist,
                        radius, speed, tilt, gravity, hasRing, description, diameter,
                        dayLen, year, distance, mass, moons, fact, img)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
            data.get('name'), data.get('emoji', '⊕'), data.get('color', '#888888'),
            data.get('glow', '#666666'), data.get('tag', ''), data.get('tagColor', '#888888'),
            data.get('dist', 100), data.get('radius', 5), data.get('speed', 1),
            data.get('tilt', 0), data.get('gravity', 9.81),
            1 if data.get('hasRing') else 0, data.get('description', ''),
            data.get('diameter', ''), data.get('dayLen', ''), data.get('year', ''),
            data.get('distance', ''), data.get('mass', ''), data.get('moons', '0'),
            data.get('fact', ''), data.get('img', '')))
        conn.commit()
        return {'ok': True, 'name': data['name']}, 200
    except Exception as e:
        return {'error': str(e)}, 400
    finally:
        conn.close()


def delete_planet(name):
    """Удалить планету по имени (админка)."""
    conn = get_db()
    cursor = conn.execute('DELETE FROM planets WHERE name = ?', (name,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    if deleted:
        return {'ok': True}, 200
    return {'error': 'Планета не найдена'}, 404
