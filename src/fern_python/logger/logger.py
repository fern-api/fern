from abc import ABC


class Logger(ABC):
    def log(self, content: str) -> None:
        ...
