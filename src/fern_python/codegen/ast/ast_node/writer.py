from __future__ import annotations

from abc import ABC, abstractmethod
from types import TracebackType
from typing import Optional, Type


class Writer(ABC):
    @abstractmethod
    def write(self, content: str) -> None:
        ...

    @abstractmethod
    def write_line(self, content: str) -> None:
        ...

    @abstractmethod
    def indent(self) -> IndentableWriter:
        ...

    @abstractmethod
    def outdent(self) -> None:
        ...


class IndentableWriter(ABC):
    @abstractmethod
    def __enter__(self) -> None:
        ...

    @abstractmethod
    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        ...
