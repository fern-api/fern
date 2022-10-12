from __future__ import annotations

from typing import Set

from ...ast_node import GenericTypeVar
from ...references import Reference
from ..code_writer import CodeWriter


class Docstring(CodeWriter):
    def get_references(self) -> Set[Reference]:
        # references in docstrings shouldn't be analyzed
        return set()

    def get_generics(self) -> Set[GenericTypeVar]:
        # generics in docstrings shouldn't be analyzed
        return set()
