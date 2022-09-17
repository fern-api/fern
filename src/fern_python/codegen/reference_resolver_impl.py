import dataclasses
from collections import defaultdict
from typing import DefaultDict, Dict, Optional, Set, Tuple

from . import AST


class ReferenceResolverImpl(AST.ReferenceResolver):
    def __init__(self, project_name: str, module_path_of_source_file: AST.ModulePath):
        self._project_name = project_name
        self._module_path_of_source_file = module_path_of_source_file
        self._default_name_to_original_references: DefaultDict[AST.QualifiedName, Set[AST.Reference]] = defaultdict(
            lambda: set()
        )
        self._original_import_to_resolved_import: Optional[Dict[AST.ReferenceImport, AST.ReferenceImport]] = None

    def register_reference(self, reference: AST.Reference) -> None:
        default_name = self._construct_qualified_name_for_reference(
            import_=reference.import_,
            qualified_name_excluding_import=reference.qualified_name_excluding_import,
        )
        self._default_name_to_original_references[default_name].add(reference)

    def resolve_references(self) -> None:
        self._original_import_to_resolved_import = {}

        for default_name, original_references in self._default_name_to_original_references.items():
            if len(original_references) == 0:
                continue

            for original_reference in original_references:
                if original_reference.import_ is None:
                    continue
                resolved_import = (
                    original_reference.import_
                    if len(original_references) == 1
                    or original_reference.import_.module == self._module_path_of_source_file
                    else dataclasses.replace(
                        original_reference.import_,
                        alias=construct_import_alias_for_collision(original_reference.import_),
                    )
                )
                self._original_import_to_resolved_import[original_reference.import_] = resolved_import

    def resolve_reference(self, reference: AST.Reference) -> str:
        if self._original_import_to_resolved_import is None:
            raise RuntimeError("References have not yet been resolved.")
        resolved_import = (
            self._original_import_to_resolved_import[reference.import_] if reference.import_ is not None else None
        )
        return ".".join(
            self._construct_qualified_name_for_reference(
                import_=resolved_import, qualified_name_excluding_import=reference.qualified_name_excluding_import
            )
        )

    def resolve_import(self, import_: AST.ReferenceImport) -> AST.ReferenceImport:
        if self._original_import_to_resolved_import is None:
            raise RuntimeError("References have not yet been resolved.")
        return self._original_import_to_resolved_import[import_]

    def _construct_qualified_name_for_reference(
        self, import_: Optional[AST.ReferenceImport], qualified_name_excluding_import: Tuple[str, ...]
    ) -> AST.QualifiedName:
        return self._construct_qualified_import_prefix_for_reference(import_) + qualified_name_excluding_import

    def _construct_qualified_import_prefix_for_reference(
        self, import_: Optional[AST.ReferenceImport]
    ) -> AST.QualifiedName:
        if import_ is None:
            return ()
        if import_.alias is not None:
            return (import_.alias,)
        if import_.named_import is not None:
            return (import_.named_import,)
        return import_.module.get_fully_qualfied_module_path(project_name=self._project_name)


def construct_import_alias_for_collision(reference_import: AST.ReferenceImport) -> str:
    parts = reference_import.module.path
    if reference_import.named_import is not None:
        parts += (reference_import.named_import,)
    if reference_import.alias is not None:
        parts += (reference_import.alias,)
    return "_".join(parts)
