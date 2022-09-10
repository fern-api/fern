from collections import defaultdict
from typing import DefaultDict, Dict, Iterator, Set, Tuple

from . import AST

QualifiedName = Tuple[str, ...]


class ReferenceResolverImpl(AST.ReferenceResolver):
    _project_name: str
    _module_path_of_source_file: AST.ModulePath
    _default_name_to_original_references: DefaultDict[QualifiedName, Set[AST.Reference]] = defaultdict(lambda: set())
    _original_reference_to_resolved_reference: Dict[AST.Reference, AST.Reference]

    def __init__(self, project_name: str, module_path_of_source_file: AST.ModulePath):
        self._project_name = project_name
        self._module_path_of_source_file = module_path_of_source_file

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
                    if len(original_references) == 1 or original_reference.module == self._module_path_of_source_file
                    else AST.Reference(
                        module=original_reference.module,
                        submodule=original_reference.submodule,
                        alias=construct_alias_for_collision(original_reference),
                        name_inside_import=original_reference.name_inside_import,
                        from_module=original_reference.from_module,
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
        if resolved_reference.from_module is None:
            qualified_name = (self._project_name,) + qualified_name

        return ".".join(qualified_name)


def construct_qualified_name_of_reference(reference: AST.Reference) -> QualifiedName:
    """
    returns the would-be qualfieid name of a reference, before resolving collisions
    """
    prefix = (
        (reference.alias,)
        if reference.alias is not None
        else (reference.submodule,)
        if reference.submodule is not None
        else reference.module
    )
    return prefix + reference.name_inside_import


def construct_alias_for_collision(reference: AST.Reference) -> str:
    parts = reference.module
    if reference.submodule is not None:
        parts += (reference.submodule,)
    if reference.alias is not None:
        parts += (reference.alias,)
    return "_".join(parts)
