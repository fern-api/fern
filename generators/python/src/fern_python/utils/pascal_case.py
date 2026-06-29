import re

from .snake_case import snake_case

_LEADING_UNDERSCORES = re.compile(r"^(_+)")
_TRAILING_UNDERSCORES = re.compile(r"(_+)$")


def pascal_case(x: str) -> str:
    snake = snake_case(x)
    leading_match = _LEADING_UNDERSCORES.match(snake)
    trailing_match = _TRAILING_UNDERSCORES.search(snake)
    leading = leading_match.group(1) if leading_match else ""
    trailing = trailing_match.group(1) if trailing_match else ""
    if leading and len(leading) + len(trailing) >= len(snake):
        return snake
    core = snake[len(leading) : len(snake) - len(trailing) if trailing else len(snake)]
    pascal = "".join(char for char in core.replace("_", " ").title() if char.isalnum())
    return f"{leading}{pascal}{trailing}"
