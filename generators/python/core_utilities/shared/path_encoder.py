import urllib.parse


def encode_path(path: str) -> str:
    path_part, _, query = path.partition("?")
    encoded = urllib.parse.quote(path_part, safe="/")
    return f"{encoded}?{query}" if query else encoded
