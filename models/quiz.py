"""Модель квиза."""
from config.database import get_db
from models.base import get_user_id


def get_quiz_questions():
    """Получить все вопросы квиза."""
    conn = get_db()
    rows = conn.execute('SELECT * FROM quiz_questions').fetchall()
    conn.close()
    questions = []
    for r in rows:
        d = dict(r)
        questions.append({
            'id': d['id'],
            'q': d['question'],
            'opts': [d['opt1'], d['opt2'], d['opt3'], d['opt4']]
        })
    return questions, 200


def check_answer(question_id, user_answer):
    """Проверить ответ на вопрос квиза."""
    conn = get_db()
    row = conn.execute(
        'SELECT correct FROM quiz_questions WHERE id = ?',
        (question_id,)
    ).fetchone()
    conn.close()
    
    if row is None:
        return None, 404
    
    correct_in_db = row['correct']
    correct_index = correct_in_db - 1
    user_answer = int(user_answer)
    
    return {
        'correct': user_answer == correct_index,
        'is_correct': user_answer == correct_index,
        'correct_answer': correct_index
    }, 200


def save_progress(question_id, correct):
    """Сохранить прогресс пользователя."""
    user_id = get_user_id()
    conn = get_db()
    conn.execute(
        'INSERT INTO quiz_progress (user_id, question_id, correct) VALUES (?, ?, ?)',
        (user_id, question_id, 1 if correct else 0)
    )
    conn.commit()
    conn.close()
    return {'ok': True, 'user_id': user_id}, 200


def get_progress():
    """Получить статистику пользователя."""
    user_id = get_user_id()
    conn = get_db()
    rows = conn.execute(
        'SELECT question_id, correct FROM quiz_progress WHERE user_id = ?',
        (user_id,)
    ).fetchall()
    conn.close()
    
    total = len(rows)
    correct = sum(1 for r in rows if r['correct'])
    return {
        'user_id': user_id,
        'total_answered': total,
        'correct': correct,
        'accuracy': round(correct / total * 100, 1) if total > 0 else 0,
        'answers': [dict(r) for r in rows]
    }, 200


def reset_progress():
    """Сбросить прогресс пользователя."""
    user_id = get_user_id()
    conn = get_db()
    conn.execute('DELETE FROM quiz_progress WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()
    return {'ok': True}, 200
