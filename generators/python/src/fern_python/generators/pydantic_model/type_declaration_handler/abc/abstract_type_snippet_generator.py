from abc import ABC, abstractmethod
from typing import Optional, TYPE_CHECKING

from fern_python.codegen import AST
from fern_python.snippet import SnippetWriter

if TYPE_CHECKING:
    from fern_python.snippet.recursion_guard import RecursionGuard


class AbstractTypeSnippetGenerator(ABC):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
    ):
        self.snippet_writer = snippet_writer

    @abstractmethod
    def generate_snippet(self, recursion_guard: Optional["RecursionGuard"] = None) -> Optional[AST.Expression]: ...
