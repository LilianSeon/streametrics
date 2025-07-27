from fastapi import APIRouter, File, Form, UploadFile, Request
from fastapi.responses import JSONResponse
from internal_api import send_to_internal_api

router = APIRouter()

@router.post("/summary")
async def summary_proxy(
    audio: UploadFile = File(...),
    streamer: str = Form(...),
    language: str = Form(...),
    game: str = Form(...),
    time: str = Form(...),
    title: str = Form(...)
):
    try:
        response = await send_to_internal_api(
            audio=audio,
            streamer=streamer,
            language=language,
            game=game,
            time=time,
            title=title
        )
        return JSONResponse(content=response)
    except Exception as e:
        print(f"[BFF ERROR] {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
