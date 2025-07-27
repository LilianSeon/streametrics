import aiohttp
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("INTERNAL_API_URL")  # API privée
API_KEY = os.getenv("INTERNAL_API_KEY")

async def send_to_internal_api(audio, streamer, language, game, time, title):
    print(f"[BFF] {streamer}")

    try:
        form = aiohttp.FormData()
        audio_bytes = await audio.read()
        form.add_field("audio", audio_bytes, filename=audio.filename, content_type="audio/wav")
        form.add_field("streamer", streamer)
        form.add_field("language", language)
        form.add_field("game", game)
        form.add_field("time", time)
        form.add_field("title", title)

        headers = {
            "x-api-key": API_KEY
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(f"{API_URL}/", data=form, headers=headers) as resp:
                print(f"[BFF] Internal API response status: {resp.status}")
                text = await resp.text()
                print(f"[BFF] Internal API response body: {text}")

                if resp.status != 200:
                    raise Exception(f"Erreur API interne: {resp.status}")
                return await resp.json()

    except Exception as e:
        print(f"[BFF ERROR] {type(e)} - {e}")
        raise
