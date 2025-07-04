cd ./src/
python -m venv venv
venv/Scripts/activate.bat
python -m uvicorn app:app --host 0.0.0.0 --port 5000 --reload --log-level debug