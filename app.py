"""COSMOS Backend — точка входа."""
import os
import secrets
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

from config.settings import DATABASE, ADMIN_PASSWORD, HOST, PORT, DEBUG
from config.database import init_db, get_db
from routes import public_bp, progress_bp, admin_bp


def create_app():
    """Фабрика приложения."""
    app = Flask(__name__, static_folder='public', static_url_path='')
    CORS(app)
    
    # Регистрация блюпринтов
    app.register_blueprint(public_bp, url_prefix='/api')
    app.register_blueprint(progress_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    
    # Главная страница
    @app.route('/')
    def index():
        return send_from_directory('public', 'index.html')
    
    @app.route('/<path:path>')
    def static_files(path):
        full_path = os.path.join('public', path)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            return send_from_directory('public', path)
        if path.startswith('api/'):
            return jsonify({'error': 'API endpoint не найден'}), 404
        return send_from_directory('public', 'index.html')
    
    @app.errorhandler(404)
    def not_found(e):
        return send_from_directory('public', 'index.html')
    
    return app


if __name__ == '__main__':
    # Генерация токена при старте
    import config.settings as settings
    settings.ADMIN_TOKEN = secrets.token_urlsafe(32)
    
    init_db()
    
    conn = get_db()
    count = conn.execute('SELECT COUNT(*) as c FROM planets').fetchone()['c']
    conn.close()
    
    if count == 0:
        print("\n⚠️  База пустая! Запустите: python seed_data.py\n")
    
    app = create_app()
    
    print("=" * 50)
    print("🚀 COSMOS Backend запущен!")
    print("=" * 50)
    print(f"📖 Сайт:      http://localhost:{PORT}")
    print(f"📡 API:       http://localhost:{PORT}/api")
    print(f"🔐 Админка:   http://localhost:{PORT}/admin.html")
    print(f"🔑 Пароль:    '{ADMIN_PASSWORD}'")
    print(f"💾 База:      {DATABASE}")
    print("=" * 50)
    
    app.run(debug=DEBUG, port=PORT, host=HOST)
