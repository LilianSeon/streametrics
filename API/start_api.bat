@echo off
echo ========================================
echo Starting FastAPI Server
echo ========================================
cd src
call venv\Scripts\activate.bat
echo.
echo Starting API on http://localhost:5000
echo.
python -m uvicorn app:app --host 0.0.0.0 --port 5000 --reload
pause