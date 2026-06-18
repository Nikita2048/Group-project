"""Работа с базой данных SQLite."""
import sqlite3
from config.settings import DATABASE


def get_db():
    """Подключение к БД."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Создание всех таблиц в БД."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS sun (
        id INTEGER PRIMARY KEY DEFAULT 1, name TEXT, emoji TEXT,
        description TEXT, fact TEXT, diameter TEXT, mass TEXT, temp TEXT,
        type TEXT, age TEXT, composition TEXT, core TEXT, img TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS planets (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,
        emoji TEXT, color TEXT, glow TEXT, tag TEXT, tagColor TEXT,
        dist REAL, radius REAL, speed REAL, tilt REAL, gravity REAL,
        hasRing INTEGER DEFAULT 0, description TEXT,
        diameter TEXT, dayLen TEXT, year TEXT, distance TEXT, mass TEXT,
        moons TEXT, fact TEXT, img TEXT,
        p3d_radius REAL, p3d_hasRings INTEGER DEFAULT 0,
        p3d_moonCount INTEGER DEFAULT 0, p3d_emissive TEXT,
        p3d_emissiveIntensity REAL DEFAULT 0, p3d_type TEXT,
        p3d_texture TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS satellites (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,
        fullName TEXT, owner TEXT, emoji TEXT, description TEXT,
        orbit TEXT, period TEXT, launched TEXT, speed TEXT,
        orbitType TEXT, orbitRadius REAL, orbitSpeed REAL, satSize REAL,
        img TEXT, diameter TEXT, distance TEXT, mass TEXT, color TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS blackholes (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT UNIQUE NOT NULL,
        text TEXT, details TEXT, img TEXT, stats TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS bh_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS galaxies (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,
        type TEXT, typeKey TEXT, distance TEXT, distanceMly REAL,
        diameter TEXT, diameterNum INTEGER, mass TEXT, stars TEXT, starsNum INTEGER,
        age TEXT, description TEXT, details TEXT, facts TEXT,
        color TEXT, glow TEXT, img TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, n TEXT UNIQUE,
        title TEXT, text TEXT, details TEXT, stats TEXT, views INTEGER DEFAULT 0)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS random_facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT,
        opt1 TEXT, opt2 TEXT, opt3 TEXT, opt4 TEXT, correct INTEGER)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS size_comparison (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,
        color TEXT, glow TEXT, diameter INTEGER, type TEXT, description TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS quiz_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
        question_id INTEGER NOT NULL, correct INTEGER NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
        game TEXT NOT NULL, score INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_galaxies_name ON galaxies(name)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_galaxies_type ON galaxies(typeKey)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_planets_name ON planets(name)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_progress(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_scores ON game_scores(user_id, game)')
    
    conn.commit()
    conn.close()
    print("✅ База данных инициализирована")
