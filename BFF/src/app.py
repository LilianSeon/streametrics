from fastapi import FastAPI
from bff_routes import router as bff_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS pour autoriser les appels depuis ton extension ou site
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://oebogjkjhmaifchplglelphhlefhiico", "http://localhost:5000"],  # adapte ça
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bff_router, prefix="/bff")
