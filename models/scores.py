"""Модель рекордов в играх."""
from config.database import get_db
from models.base import get_user_id


def save_score(game, score):
    """Сохранить рекорд."""
    user_id = get_user_id()
    conn = get_db()
    conn.execute(
        'INSERT INTO game_scores (user_id, game, score) VALUES (?, ?, ?)',
        (user_id, game, int(score))
    )
    conn.commit()
    conn.close()
    return {'ok': True, 'user_id': user_id, 'game': game, 'score': score}, 200


def get_best_score(game):
    """Получить лучший результат пользователя."""
    user_id = get_user_id()
    conn = get_db()
    row = conn.execute(
        'SELECT MAX(score) as best FROM game_scores WHERE user_id = ? AND game = ?',
        (user_id, game)
    ).fetchone()
    conn.close()
    return {
        'user_id': user_id,
        'game': game,
        'best': row['best'] or 0
    }, 200


def get_leaderboard(game):
    """Получить топ-10 игроков."""
    conn = get_db()
    rows = conn.execute(
        'SELECT user_id, MAX(score) as best FROM game_scores WHERE game = ? '
        'GROUP BY user_id ORDER BY best DESC LIMIT 10',
        (game,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows], 200
