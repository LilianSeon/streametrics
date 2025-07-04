import asyncio
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form
from fastapi.responses import JSONResponse
from concurrent.futures import ThreadPoolExecutor
#from slowapi import Limiter
#from slowapi.util import get_remote_address

import tempfile
import os
import whisper
import requests

router = APIRouter()
#limiter = Limiter(key_func=get_remote_address)
#router.state.limiter = limiter

API_KEY = "streametrics-secret"

# Charger Whisper et le modèle de résumé
whisper_model = whisper.load_model("small")

executor = ThreadPoolExecutor(max_workers=4)

MAX_FILE_SIZE_MB = 35 # 35Mo
ALLOWED_MIME_TYPES = ["audio/wav", "audio/x-wav"]

def summarize_with_mistral(text: str, streamer: str, game: str, title: str, lang="en"):
    if lang == "en":
        language = 'anglais'
    elif lang == "fr":
        language = 'français'

    prompt = (
        f"Voici une transcription d'un passage oral où { streamer } parle pendant un stream dans la catégorie '{ game }', dont le titre du stream est : '{ title }':\n\n"
        f"{text.strip()}\n\n"
        f"Donne un résumé très court de qualité (deux ou trois phrases max) de ce qu'il a dit retenant les sujets les plus importants.\n\n"
        f"Le résumé doit être en { language }.\n\n"
        f"Ne fait pas mention du titre."
    )
    try:
        res = requests.post("http://localhost:11434/api/generate", json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        })
        return res.json()['response'].strip()
    except Exception as e:
        return f"[Erreur résumé Mistral] {e}"
    
def transcribe_audio(temp_path: str):
    return whisper_model.transcribe(
        temp_path,
        fp16=False,
        no_speech_threshold=0.3,
        condition_on_previous_text=True,
        temperature=0.0
    )["text"]

def validate_api_key(x_api_key: str = Header(...)):
    print(x_api_key, API_KEY)
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

@router.post("/")
#@limiter.limit("4/minute")  # max 4 requets per minute
async def summarize(
        audio: UploadFile = File(...),
        streamer: str = Form(...),
        language: str = Form(...),
        game: str = Form(...),
        time: str = Form(...),
        title: str = Form(...),
        #x_api_key: str = Depends(validate_api_key)
    ):

    temp_path = None

    try:
        print(streamer)

        file_bytes = await audio.read()

        # File's size
        size_mb = len(file_bytes) / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            raise HTTPException(status_code=413, detail="File too large")
        
        # MIME type
        if not audio.filename.lower().endswith('.wav'):
            raise HTTPException(status_code=415, detail="Unsupported file type")
        
        for champ in [streamer, title, game]:
            if any(c in champ for c in ["<", ">", "{", "}", ";"]):
                raise HTTPException(status_code=400, detail="Invalid characters in fields")

        # Sauvegarde temporaire du fichier
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(file_bytes)
            temp_path = tmp.name

        # Transcription in a dedicated thread
        transcription = await asyncio.get_event_loop().run_in_executor(executor, transcribe_audio, temp_path)

        print(transcription)

        if len(transcription.strip()) < 20:
            summary = transcription
        else:
            summary = summarize_with_mistral(transcription, streamer, game, title, language)

        return JSONResponse(content={"text": transcription, "summary": summary, "time": time, "streamerName": streamer })

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
