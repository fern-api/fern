import dataclasses
from collections import defaultdict
from typing import DefaultDict, Dict, Iterator, Set, Tuple

from . import AST

QualifiedName = Tuple[str, ...]


class ReferenceResolverImpl(AST.ReferenceResolver):
    def __init__(self, project_name: str, module_path_of_source_file: AST.ModulePath):
        self._project_name = project_name
        self._module_path_of_source_file = module_path_of_source_file
        self._default_name_to_original_references: DefaultDict[QualifiedName, Set[AST.Reference]] = defaultdict(
            lambda: set()
        )
        self._original_reference_to_resolved_reference: Dict[AST.Reference, AST.Reference]

    def register_reference(self, reference: AST.Reference) -> None:
        default_name = construct_qualified_name_of_reference(reference)
        self._default_name_to_original_references[default_name].add(reference)

    def resolve_references(self) -> None:
        self._original_reference_to_resolved_reference = {}

        for default_name, original_references in self._default_name_to_original_references.items():
            if len(original_references) == 0:
                continue

            for original_reference in original_references:
                resolved_reference = (
                    original_reference
                    if len(original_references) == 1
                    or original_reference.import_ is None
                    or original_reference.import_.module == self._module_path_of_source_file
                    else dataclasses.replace(
                        original_reference,
                        import_=dataclasses.replace(
                            original_reference.import_,
                            alias=construct_import_alias_for_collision(original_reference.import_),
                        ),
                    )
                )

                self._original_reference_to_resolved_reference[original_reference] = resolved_reference

    def get_resolved_references(self) -> Iterator[AST.Reference]:
        if self._original_reference_to_resolved_reference is None:
            raise RuntimeError("References have not yet been resolved.")
        return iter(self._original_reference_to_resolved_reference.values())

    def resolve_reference(self, reference: AST.Reference) -> str:
        if self._original_reference_to_resolved_reference is None:
            raise RuntimeError("References have not yet been resolved.")
        resolved_reference = self._original_reference_to_resolved_reference[reference]

        qualified_name = construct_qualified_name_of_reference(resolved_reference)
        return ".".join(qualified_name)


def construct_qualified_name_of_reference(reference: AST.Reference) -> QualifiedName:
    """
    returns the would-be qualfieid name of a reference, before resolving collisions
    """
    prefix = (
        ()
        if reference.import_ is None
        else (reference.import_.alias,)
        if reference.import_.alias is not None
        else (reference.import_.named_import,)
        if reference.import_.named_import is not None
        else reference.import_.module
    )
    return prefix + reference.qualified_name_excluding_import


def construct_import_alias_for_collision(reference_import: AST.ReferenceImport) -> str:
    parts = reference_import.module
    if reference_import.named_import is not None:
        parts += (reference_import.named_import,)
    if reference_import.alias is not None:
        parts += (reference_import.alias,)
    return "_".join(parts)
