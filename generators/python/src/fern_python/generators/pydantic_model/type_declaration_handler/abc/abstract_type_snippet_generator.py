from abc import ABC, abstractmethod
from typing import Optional

from fern_python.codegen import AST
from fern_python.snippet import SnippetWriter


class AbstractTypeSnippetGenerator(ABC):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
    ):
        self.snippet_writer = snippet_writer

    @abstractmethod
    def generate_snippet(self) -> Optional[AST.Expression]:
        ...
