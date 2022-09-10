from typing import Set

from ...ast_node import ReferenceResolver
from ...reference import Reference
from .code_writer import CodeWriter


class ReferenceLoader(ReferenceResolver):
    _references: Set[Reference] = set()

    def resolve_reference(self, reference: Reference) -> str:
        self._references.add(reference)
        return "<UNRESOLVED REFERENCE>"

    def get_references(self) -> Set[Reference]:
        return self._references


def get_references_from_code_writer(code_writer: CodeWriter) -> Set[Reference]:
    if isinstance(code_writer, str):
        return set()
    reference_loader = ReferenceLoader()
    code_writer(reference_resolver=reference_loader)
    return reference_loader.get_references()
