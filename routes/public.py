"""Публичные API-эндпоинты."""
from datetime import datetime
from flask import Blueprint, jsonify, request

from models import sun, planets, satellites, blackholes, galaxies, facts, quiz

public_bp = Blueprint('public', __name__)


@public_bp.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'time': datetime.now().isoformat(),
        'message': 'COSMOS API работает! 🚀'
    })


@public_bp.route('/sun')
def get_sun():
    data, code = sun.get_sun()
    if code == 404:
        return jsonify({'error': 'Солнце не найдено в БД'}), code
    return jsonify(data)


@public_bp.route('/planets')
def get_planets():
    data, _ = planets.get_all_planets()
    return jsonify(data)


@public_bp.route('/planets/<name>')
def get_planet(name):
    data, code = planets.get_planet_by_name(name)
    if code == 404:
        return jsonify({'error': 'Планета не найдена'}), code
    return jsonify(data)


@public_bp.route('/satellites')
def get_satellites():
    data, _ = satellites.get_all_satellites()
    return jsonify(data)


@public_bp.route('/moon')
def get_moon():
    data, _ = satellites.get_moon()
    return jsonify(data)


@public_bp.route('/blackholes')
def get_blackholes():
    data, _ = blackholes.get_blackholes()
    return jsonify(data)


@public_bp.route('/galaxies')
def get_galaxies():
    search = request.args.get('search', '').strip()
    galaxy_type = request.args.get('type', 'all').strip()
    sort = request.args.get('sort', 'name')
    order = request.args.get('order', 'asc')
    
    data, _ = galaxies.get_galaxies(search, galaxy_type, sort, order)
    return jsonify(data)


@public_bp.route('/facts')
def get_facts():
    data, _ = facts.get_all_facts()
    return jsonify(data)


@public_bp.route('/facts/<n>')
def get_fact(n):
    data, code = facts.get_fact_by_n(n)
    if code == 404:
        return jsonify({'error': 'Факт не найден'}), code
    return jsonify(data)


@public_bp.route('/random-facts')
def get_random_facts():
    data, _ = facts.get_random_facts()
    return jsonify(data)


@public_bp.route('/random-fact')
def get_random_fact():
    data, code = facts.get_random_fact()
    if code == 404:
        return jsonify({'error': 'Случайные факты не найдены'}), code
    return jsonify(data)


@public_bp.route('/quiz')
def get_quiz():
    data, _ = quiz.get_quiz_questions()
    return jsonify(data)


@public_bp.route('/size-comparison')
def get_size_comparison():
    from config.database import get_db
    conn = get_db()
    rows = conn.execute('SELECT * FROM size_comparison ORDER BY diameter DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])
