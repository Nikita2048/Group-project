"""API админ-панели."""
import json
import secrets
from flask import Blueprint, jsonify, request

from config.settings import ADMIN_PASSWORD, ADMIN_TOKEN
from models.base import admin_required
from config.database import get_db
from models import planets as planets_model

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data or data.get('password') != ADMIN_PASSWORD:
        return jsonify({'error': 'Неверный пароль'}), 401
    
    global ADMIN_TOKEN
    ADMIN_TOKEN = secrets.token_urlsafe(32)
    return jsonify({
        'token': ADMIN_TOKEN,
        'message': 'Вход выполнен'
    })


@admin_bp.route('/admin/stats')
@admin_required
def admin_stats():
    conn = get_db()
    stats = {
        'planets': conn.execute('SELECT COUNT(*) as c FROM planets').fetchone()['c'],
        'satellites': conn.execute('SELECT COUNT(*) as c FROM satellites').fetchone()['c'],
        'blackholes': conn.execute('SELECT COUNT(*) as c FROM blackholes').fetchone()['c'],
        'galaxies': conn.execute('SELECT COUNT(*) as c FROM galaxies').fetchone()['c'],
        'facts': conn.execute('SELECT COUNT(*) as c FROM facts').fetchone()['c'],
        'random_facts': conn.execute('SELECT COUNT(*) as c FROM random_facts').fetchone()['c'],
        'quiz_questions': conn.execute('SELECT COUNT(*) as c FROM quiz_questions').fetchone()['c'],
        'quiz_progress': conn.execute('SELECT COUNT(*) as c FROM quiz_progress').fetchone()['c'],
        'game_scores': conn.execute('SELECT COUNT(*) as c FROM game_scores').fetchone()['c'],
    }
    conn.close()
    return jsonify(stats)


@admin_bp.route('/admin/planets', methods=['POST'])
@admin_required
def admin_create_planet():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Нужно поле name'}), 400
    
    result, code = planets_model.create_planet(data)
    return jsonify(result), code


@admin_bp.route('/admin/planets/<name>', methods=['DELETE'])
@admin_required
def admin_delete_planet(name):
    result, code = planets_model.delete_planet(name)
    return jsonify(result), code
