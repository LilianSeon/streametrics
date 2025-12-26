import os
import whisper
import requests
from celery_app import celery
from requests.exceptions import Timeout, RequestException
import time

whisper_model = whisper.load_model("small")

# Configuration for timeouts and retries
MISTRAL_TIMEOUT = 60  # 60 seconds timeout for Mistral API
MISTRAL_MAX_RETRIES = 3
MISTRAL_RETRY_DELAY = 2  # seconds between retries

def check_mistral_health():
    """Check if Mistral service is available"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        return response.status_code == 200
    except Exception:
        return False

def summarize_with_mistral(text: str, streamer: str, game: str, title: str, lang="en"):
    if lang == "en":
        language = 'anglais'
    elif lang == "fr":
        language = 'français'

    prompt = (
        f"Voici une transcription d'un passage oral où { streamer } parle pendant un stream dans la catégorie '{ game }', dont le titre du stream est : '{ title }':\n\n"
        f"{text.strip()}\n\n"
        f"Donne un résumé très court de qualité (deux ou trois phrases max) de ce qu'il a dit.\n"
        f"Le résumé doit être en { language }."
    )

    last_error = None
    for attempt in range(MISTRAL_MAX_RETRIES):
        try:
            res = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "mistral",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=MISTRAL_TIMEOUT
            )
            res.raise_for_status()
            return res.json()["response"].strip()

        except Timeout:
            last_error = f"Mistral API timeout (attempt {attempt + 1}/{MISTRAL_MAX_RETRIES})"
            if attempt < MISTRAL_MAX_RETRIES - 1:
                time.sleep(MISTRAL_RETRY_DELAY * (attempt + 1))  # Exponential backoff
                continue

        except RequestException as e:
            last_error = f"Mistral API error: {str(e)} (attempt {attempt + 1}/{MISTRAL_MAX_RETRIES})"
            if attempt < MISTRAL_MAX_RETRIES - 1:
                time.sleep(MISTRAL_RETRY_DELAY * (attempt + 1))
                continue

        except Exception as e:
            last_error = f"Unexpected error: {str(e)}"
            break

    raise Exception(f"Failed to get summary from Mistral after {MISTRAL_MAX_RETRIES} attempts. Last error: {last_error}")


def transcribe_audio(path):
    return whisper_model.transcribe(
        path,
        fp16=False,
        no_speech_threshold=0.6,
        condition_on_previous_text=True,
        temperature=0.4
    )["text"]


@celery.task(bind=True)
def process_audio_task(self, temp_path, streamer, language, game, title, time):
    try:
        # Update state: Starting transcription
        self.update_state(
            state='PROGRESS',
            meta={
                'current_step': 'transcribing',
                'progress': 0,
                'status': 'Transcribing audio...'
            }
        )

        # Check Mistral health before starting
        if not check_mistral_health():
            self.update_state(
                state='PROGRESS',
                meta={
                    'current_step': 'warning',
                    'progress': 0,
                    'status': 'Warning: Mistral service may be unavailable. Proceeding with transcription...'
                }
            )

        transcription = transcribe_audio(temp_path)

        # Update state: Transcription complete
        self.update_state(
            state='PROGRESS',
            meta={
                'current_step': 'transcription_complete',
                'progress': 50,
                'status': 'Transcription complete. Generating summary...',
                'transcription': transcription
            }
        )

        # Generate summary
        if len(transcription.strip()) < 10:
            summary = transcription
        else:
            # Update state: Summarizing
            self.update_state(
                state='PROGRESS',
                meta={
                    'current_step': 'summarizing',
                    'progress': 60,
                    'status': 'Generating summary with Mistral...'
                }
            )

            summary = summarize_with_mistral(transcription, streamer, game, title, language)

        # Clean up temp file
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception as e:
            print(f"Failed to delete temp file {temp_path}: {e}")

        # Return final result
        return {
            "text": transcription,
            "summary": summary,
            "time": time,
            "streamerName": streamer,
            'currentStep': 'done'
        }

    except Exception as e:
        # Clean up temp file on error
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except:
            pass

        # Let Celery handle the failure by raising the exception
        raise
