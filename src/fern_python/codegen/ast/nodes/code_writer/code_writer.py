from typing import Protocol, Union

from ...ast_node import ReferenceResolver


class CodeWriterFunction(Protocol):
    def __call__(self, reference_resolver: ReferenceResolver) -> str:
        ...


CodeWriter = Union[CodeWriterFunction, str]
