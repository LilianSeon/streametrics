from fastapi import APIRouter, HTTPException, UploadFile, File, Form

import tempfile
import os
from tasks.tasks import process_audio_task
from celery_app import celery
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

API_KEY = os.getenv("INTERNAL_API_KEY")

router = APIRouter()

MAX_FILE_SIZE_MB = 35 # 35Mo
ALLOWED_MIME_TYPES = ["audio/wav", "audio/x-wav"]

@router.post("/")
async def summarize(
        audio: UploadFile = File(...),
        streamer: str = Form(...),
        language: str = Form(...),
        game: str = Form(...),
        time: str = Form(...),
        title: str = Form(...),
    ):

    file_bytes = await audio.read()
    size_mb = len(file_bytes) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=413, detail="File too large")

    if not audio.filename.lower().endswith('.wav'):
        raise HTTPException(status_code=415, detail="Unsupported file type")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(file_bytes)
        temp_path = tmp.name

    # Lancer la tâche Celery
    task = process_audio_task.delay(temp_path, streamer, language, game, title, time)

    return {"task_id": task.id}

@router.get("/status/{task_id}")
async def get_status(task_id: str):

    task = celery.AsyncResult(task_id)

    if task.state == "PENDING":
        return {
            "status": "pending",
            "current_step": "pending",
            "progress": 0,
            "message": "Task is waiting to be processed..."
        }

    if task.state == "STARTED":
        return {
            "status": "processing",
            "current_step": "processing",
            "progress": 10,
            "message": "Task has started processing..."
        }

    if task.state == "PROGRESS":
        # Return detailed progress information
        return {
            "status": "processing",
            "progress": task.info.get("progress", 0),
            "current_step": task.info.get("current_step", "unknown"),
            "message": task.info.get("status", "Processing..."),
            "transcription": task.info.get("transcription", None)
        }

    if task.state == "SUCCESS":
        return {
            "status": "done",
            "current_step": task.info.get("current_step", "done"),
            "progress": 100,
            "result": task.result
        }

    if task.state == "FAILURE":
        # task.info contains the exception when task fails
        error_message = str(task.info) if task.info else "Unknown error"
        return {
            "status": "error",
            "current_step": "error",
            "progress": 0,
            "error": error_message,
            "message": "An error occurred during processing"
        }

    # Unknown state
    return {
        "status": "unknown",
        "state": task.state,
        "message": "Unknown task state"
    }