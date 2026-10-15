import json

def format_payload(data: dict) -> str:
    """Format dictionary as JSON string."""
    return json.dumps(data)
