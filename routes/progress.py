"""API для прогресса пользователей."""
from flask import Blueprint, jsonify, request

from models import quiz, scores

progress_bp = Blueprint('progress', __name__)


@progress_bp.route('/quiz/check', methods=['POST'])
def check_quiz_answer():
    data = request.get_json()
    if not data or 'question_id' not in data or 'answer' not in data:
        return jsonify({'error': 'Нужен question_id и answer'}), 400
    
    result, code = quiz.check_answer(data['question_id'], data['answer'])
    if code == 404:
        return jsonify({'error': 'Вопрос не найден'}), code
    return jsonify(result)


@progress_bp.route('/progress/quiz', methods=['GET'])
def get_quiz_progress():
    data, _ = quiz.get_progress()
    return jsonify(data)


@progress_bp.route('/progress/quiz', methods=['POST'])
def save_quiz_progress():
    data = request.get_json()
    if not data or 'question_id' not in data or 'correct' not in data:
        return jsonify({'error': 'Нужен question_id и correct'}), 400
    
    result, _ = quiz.save_progress(data['question_id'], data['correct'])
    return jsonify(result)


@progress_bp.route('/progress/quiz/reset', methods=['POST'])
def reset_quiz_progress():
    result, _ = quiz.reset_progress()
    return jsonify(result)


@progress_bp.route('/scores', methods=['POST'])
def save_score():
    data = request.get_json()
    if not data or 'game' not in data or 'score' not in data:
        return jsonify({'error': 'Нужен game и score'}), 400
    
    result, _ = scores.save_score(data['game'], data['score'])
    return jsonify(result)


@progress_bp.route('/scores/<game>')
def get_best_score(game):
    result, _ = scores.get_best_score(game)
    return jsonify(result)


@progress_bp.route('/scores/<game>/leaderboard')
def get_leaderboard(game):
    data, _ = scores.get_leaderboard(game)
    return jsonify(data)
