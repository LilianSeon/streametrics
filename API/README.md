# StreaMetrics API

FastAPI API for audio stream transcription and summarization using Whisper and Mistral.

## Prerequisites

Before starting, make sure you have installed:

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **Redis** - Required for Celery
   - Option 1: Docker - `docker run -d -p 6379:6379 redis`
   - Option 2: [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
3. **Ollama** with Mistral model - [Install Ollama](https://ollama.ai)
   ```bash
   ollama pull mistral
   ```

## Quick Installation

1. Run `setup.bat` to install all dependencies:
   ```bash
   setup.bat
   ```

## Starting the Application

The application requires **4 services** running:

### Service 1: Redis (if not already running)
```bash
# Docker option (recommended)
docker run -d -p 6379:6379 redis

# Local installation option
redis-server
```

### Service 2: Ollama with Mistral
```bash
# Make sure Ollama is running
ollama serve
```

### Service 3: Celery Worker
Open a terminal and run:
```bash
start_celery.bat
```

### Service 4: FastAPI Server
Open another terminal and run:
```bash
start_api.bat
```

## Verification

Once all services are started, test the API:

```bash
curl http://localhost:5000/
```

You should receive:
```json
{"message":"Welcome to StreaMetrics's API"}
```

## API Usage

### Send an audio file for processing

```bash
curl -X POST http://localhost:5000/summarize/ \
  -F "audio=@path/to/file.wav" \
  -F "streamer=StreamerName" \
  -F "language=en" \
  -F "game=Just Chatting" \
  -F "time=00:15:30" \
  -F "title=Stream title"
```

Response:
```json
{"task_id": "abc-123-def-456"}
```

### Check task status

```bash
curl http://localhost:5000/summarize/status/abc-123-def-456
```

Possible responses:

**Pending:**
```json
{
  "status": "pending",
  "progress": 0,
  "message": "Task is waiting to be processed..."
}
```

**Transcribing:**
```json
{
  "status": "processing",
  "progress": 0,
  "current_step": "transcribing",
  "message": "Transcribing audio...",
  "transcription": null
}
```

**Transcription completed:**
```json
{
  "status": "processing",
  "progress": 50,
  "current_step": "transcription_complete",
  "message": "Transcription complete. Generating summary...",
  "transcription": "Transcribed text..."
}
```

**Summarizing:**
```json
{
  "status": "processing",
  "progress": 60,
  "current_step": "summarizing",
  "message": "Generating summary with Mistral...",
  "transcription": "Transcribed text..."
}
```

**Completed:**
```json
{
  "status": "done",
  "progress": 100,
  "result": {
    "text": "Full transcription...",
    "summary": "Content summary...",
    "time": "00:15:30",
    "streamerName": "StreamerName"
  }
}
```

**Error:**
```json
{
  "status": "error",
  "progress": 0,
  "error": "Error description",
  "message": "An error occurred during processing"
}
```

## High Latency Handling Improvements

This version includes several improvements to handle latency issues:

### 1. Timeouts and Retries
- 60-second timeout for Mistral API calls
- 3 automatic retries with exponential backoff (2s, 4s, 6s)
- Network error and timeout handling

### 2. Detailed Progress Tracking
- Percentage progress (0-100%)
- Detailed steps (transcription, summarization)
- Informative messages at each step
- Partial results available (transcription before summary)

### 3. Optimized Celery Configuration
- Time limits: 10 minutes (hard), 9 minutes (soft)
- Task tracking enabled
- Result expiration after 1 hour
- Single worker at a time for long tasks

### 4. Health Check
- Mistral service availability verification
- Warnings if service is unavailable
- Automatic cleanup of temporary files

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /summarize/
       ▼
┌─────────────────┐
│  FastAPI Server │
│   (port 5000)   │
└──────┬──────────┘
       │ Enqueue task
       ▼
┌─────────────────┐
│  Redis Broker   │
│   (port 6379)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐     ┌─────────────┐
│  Celery Worker  │────▶│   Whisper   │
│                 │     │ (transcribe)│
└────────┬────────┘     └─────────────┘
         │
         │              ┌─────────────┐
         └─────────────▶│   Mistral   │
                        │ (summarize) │
                        └─────────────┘
```

## Configuration

### Environment Variables (.env)

```env
INTERNAL_API_KEY="streametrics-secret"
```

### Configurable Timeouts (tasks/tasks.py)

```python
MISTRAL_TIMEOUT = 60  # Timeout in seconds
MISTRAL_MAX_RETRIES = 3  # Number of retries
MISTRAL_RETRY_DELAY = 2  # Delay between retries
```

## Troubleshooting

### Redis is not accessible
```
Error: Error 61 connecting to localhost:6379. Connection refused.
```
**Solution:** Start Redis with `redis-server` or Docker

### Ollama/Mistral is not accessible
```
Warning: Mistral service may be unavailable
```
**Solution:** Start Ollama with `ollama serve` and verify that the Mistral model is installed

### Celery worker won't start on Windows
```
Error: Pool solo is not supported
```
**Solution:** Use `--pool=solo` (already included in start_celery.bat)

### Timeout issues
If tasks take too long:
1. Increase `MISTRAL_TIMEOUT` in [tasks/tasks.py](src/tasks/tasks.py#L11)
2. Increase `task_time_limit` in [celery_app.py](src/celery_app.py#L14)

## Support

For any questions or issues, please create an issue on the GitHub repository.
