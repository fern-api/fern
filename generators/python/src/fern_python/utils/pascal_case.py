from .snake_case import snake_case


def pascal_case(x: str) -> str:
    return "".join(char for char in snake_case(x).replace("_", " ").title() if char.isalnum())
