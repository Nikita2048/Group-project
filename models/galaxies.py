"""Модель галактик."""
from config.database import get_db
from models.base import row_to_dict


def get_galaxies(search='', galaxy_type='all', sort='name', order='asc'):
    """Получить галактики с фильтрами."""
    conn = get_db()
    
    query = 'SELECT * FROM galaxies WHERE 1=1'
    params = []
    
    if search:
        query += ''' AND (
            name LIKE ? COLLATE NOCASE OR LOWER(name) LIKE ? OR name LIKE ? OR
            description LIKE ? COLLATE NOCASE OR LOWER(description) LIKE ? OR description LIKE ? OR
            type LIKE ? COLLATE NOCASE OR LOWER(type) LIKE ? OR type LIKE ? OR
            details LIKE ? COLLATE NOCASE OR LOWER(details) LIKE ? OR details LIKE ?
        )'''
        search_orig = f'%{search}%'
        search_lower = f'%{search.lower()}%'
        search_upper = f'%{search.upper()}%'
        params.extend([search_orig, search_lower, search_upper] * 4)
    
    if galaxy_type and galaxy_type != 'all':
        query += ' AND typeKey = ?'
        params.append(galaxy_type)
    
    sort_map = {'name': 'name', 'distance': 'distanceMly', 'diameter': 'diameterNum', 'stars': 'starsNum'}
    sort_column = sort_map.get(sort, 'name')
    if order.upper() not in ['ASC', 'DESC']:
        order = 'ASC'
    query += f' ORDER BY {sort_column} {order.upper()}'
    
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows], 200
