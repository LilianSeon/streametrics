@echo off
echo ========================================
echo Starting Celery Worker
echo ========================================
cd src
call venv\Scripts\activate.bat
echo.
echo Starting Celery worker with solo pool (Windows compatible)...
echo.
celery -A celery_app worker --loglevel=info --pool=solo
pause