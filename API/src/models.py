from pydantic import BaseModel
from fastapi import UploadFile

class InfoStreamer(BaseModel):
    audio: UploadFile
    streamer: str
    language: str
    game: str