from celery import Celery

celery = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=['tasks.tasks']  # Import tasks module so Celery can find them
)

# Configure Celery for better handling of long-running tasks
celery.conf.update(
    task_track_started=True,  # Track when tasks start
    task_send_sent_event=True,  # Send task-sent events
    result_expires=3600,  # Results expire after 1 hour
    task_time_limit=600,  # Hard time limit: 10 minutes (600 seconds)
    task_soft_time_limit=540,  # Soft time limit: 9 minutes (540 seconds)
    broker_connection_retry_on_startup=True,  # Retry broker connection on startup
    task_acks_late=True,  # Acknowledge tasks after completion (better for reliability)
    worker_prefetch_multiplier=1,  # Fetch one task at a time (better for long tasks)
)
