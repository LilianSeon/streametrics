from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

import tempfile
import os
import whisper
import requests

router = APIRouter()

# Charger Whisper et le modèle de résumé
whisper_model = whisper.load_model("base")

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

@router.post("/")
async def summarize(
        audio: UploadFile = File(...),
        streamer: str = Form(...),
        language: str = Form(...),
        game: str = Form(...),
        time: str = Form(...),
        title: str = Form(...)
    ):

    temp_path = None

    try:
        print(streamer)

        file_bytes = await audio.read()

        # Sauvegarde temporaire du fichier
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(file_bytes)
            temp_path = tmp.name

        result = whisper_model.transcribe(temp_path, fp16=False, no_speech_threshold=0.6)
        transcription = result["text"]

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
