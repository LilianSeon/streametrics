from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import summarize

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à adapter en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes de summarize
app.include_router(summarize.router, prefix="/summarize", tags=["Summarize"])


@app.get("/")
async def root():
    return {"message": "Welcome to StreaMetrics's API"}