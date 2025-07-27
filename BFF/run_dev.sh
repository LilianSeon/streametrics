#!/bin/bash

# Se placer dans le dossier src (optionnel si tu lances depuis src)
cd src

# Lancer uvicorn
python -m uvicorn app:app --host 0.0.0.0 --port 5050 --reload --log-level debug
