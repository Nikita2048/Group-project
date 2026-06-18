@echo off
chcp 65001
echo ====================================
echo COSMOS Backend - Windows
echo ====================================
echo.

REM Проверяем Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Python не найден!
    echo Установите Python 3.8+ с https://www.python.org/
    pause
    exit /b 1
)

REM Устанавливаем зависимости если нужно
if not exist ".venv" (
    echo Устанавливаю зависимости...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

REM Проверяем есть ли БД, если нет - заполняем
if not exist "cosmos.db" (
    echo База данных не найдена, заполняю...
    python seed_data.py
    echo.
)

REM Запускаем сервер
echo Запускаю сервер...
echo Откройте в браузере: http://localhost:5000
echo.
python app.py

pause
