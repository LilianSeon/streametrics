@echo off
echo ========================================
echo Setting up StreaMetrics API
echo ========================================
echo.
echo Step 1: Creating virtual environment...
cd src
python -m venv venv
echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat
echo.
echo Step 3: Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure Redis is running (redis-server or Docker)
echo 2. Make sure Ollama is running with Mistral model (ollama pull mistral)
echo 3. Run start_celery.bat in one terminal
echo 4. Run start_api.bat in another terminal
echo.
pause