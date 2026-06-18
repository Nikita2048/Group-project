"""Базовые функции для моделей."""
import json
import secrets
from functools import wraps
from flask import request, jsonify

from config.settings import ADMIN_TOKEN


def row_to_dict(row):
    """Преобразует Row в dict, парсит JSON-поля."""
    if row is None:
        return None
    d = dict(row)
    for json_field in ['stats', 'facts']:
        if json_field in d and d[json_field] and isinstance(d[json_field], str):
            try:
                d[json_field] = json.loads(d[json_field])
            except:
                d[json_field] = []
    return d


def get_user_id():
    """Получает или генерирует ID пользователя."""
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        user_id = 'anon_' + secrets.token_hex(8)
    return user_id


def check_admin():
    """Проверяет токен админа."""
    token = request.headers.get('X-Admin-Token')
    return token == ADMIN_TOKEN


def admin_required(f):
    """Декоратор для защиты админ-эндпоинтов."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not check_admin():
            return jsonify({'error': 'Требуется авторизация админа'}), 401
        return f(*args, **kwargs)
    return decorated
