@echo off
cd /d "%~dp0"
py -m venv .venv-ia
call .venv-ia\Scripts\activate
python -m pip install -q -r backend\requirements.txt
uvicorn backend.server:app --host 127.0.0.1 --port 8000
