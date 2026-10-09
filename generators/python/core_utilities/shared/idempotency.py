import uuid


def generate_idempotency_key() -> str:
    return str(uuid.uuid4())
