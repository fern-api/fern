import dataclasses
from collections import defaultdict
from typing import DefaultDict, Dict, Optional, Set

from ordered_set import OrderedSet

from fern_python.codegen.node_writer_impl import NodeWriterImpl

from . import AST
from .reference_resolver import ReferenceResolver


@dataclasses.dataclass
class ResolvedImport:
    import_: Optional[AST.ReferenceImport]
    prefix_for_qualfied_names: AST.QualifiedName


class ReferenceResolverImpl(ReferenceResolver):
    def __init__(self, module_path_of_source_file: AST.ModulePath):
        self._module_path_of_source_file = module_path_of_source_file
        self._default_name_to_original_references: DefaultDict[
            AST.QualifiedName, OrderedSet[AST.Reference]
        ] = defaultdict(OrderedSet)
        self._original_import_to_resolved_import: Optional[Dict[AST.ReferenceImport, ResolvedImport]] = None
        self._does_file_self_import = False
        self._declarations: Set[AST.QualifiedName] = set()

    def register_reference(self, reference: AST.Reference) -> None:
        default_name = self._construct_qualified_name_for_reference(reference)
        self._default_name_to_original_references[default_name].add(reference)

    def register_declaration(self, declaration: str) -> None:
        self._declarations.add((declaration,))

    def resolve_references(self) -> None:
        self._original_import_to_resolved_import = {}

        for default_name, original_references in self._default_name_to_original_references.items():
            # get the set of all imports that result in this default name.
            # if len(set) > 1, or this default name is the same as a declaration,
            # then there's a collision, so we need to alias the imports.
            original_imports = OrderedSet(
                reference.import_ for reference in original_references if reference.import_ is not None
            )

            for original_reference in original_references:
                if original_reference.import_ is None:
                    continue

                import_: Optional[AST.ReferenceImport] = original_reference.import_
                prefix_for_qualfied_names: AST.QualifiedName = ()

                if original_reference.import_.module.path == self._module_path_of_source_file:
                    self._does_file_self_import = True
                    if original_reference.import_.named_import is not None:
                        import_ = None
                        prefix_for_qualfied_names = (original_reference.import_.named_import,)
                    else:
                        raise RuntimeError(
                            f"Intra-file reference in {self._module_path_of_source_file} is not using a named import: "
                            + ".".join(self._construct_qualified_name_for_reference(original_reference))
                        )
                    if original_reference.import_.alias is not None:
                        raise RuntimeError(
                            f"Intra-file reference in {self._module_path_of_source_file} is using an alias import"
                            + ".".join(self._construct_qualified_name_for_reference(original_reference))
                        )
                elif len(original_imports) > 1 or default_name in self._declarations:
                    import_ = dataclasses.replace(
                        import_,
                        alias=construct_import_alias_for_collision(original_reference.import_),
                    )  # type: ignore
                    # see https://github.com/python/mypy/pull/15962 for the mypy issue

                self._original_import_to_resolved_import[original_reference.import_] = ResolvedImport(
                    import_=import_,
                    prefix_for_qualfied_names=prefix_for_qualfied_names,
                )

    def resolve_reference(self, reference: AST.Reference, writer: AST.NodeWriter) -> str:
        if self._original_import_to_resolved_import is None:
            raise RuntimeError("References have not yet been resolved.")

        resolved_import = (
            self._original_import_to_resolved_import[reference.import_] if reference.import_ is not None else None
        )
        resolved_qualified_name_excluding_import = (
            resolved_import.prefix_for_qualfied_names + reference.qualified_name_excluding_import
            if resolved_import is not None
            else reference.qualified_name_excluding_import
        )
        resolved_reference = ".".join(
            self._construct_qualified_name_for_reference(
                AST.Reference(
                    qualified_name_excluding_import=resolved_qualified_name_excluding_import,
                    import_=resolved_import.import_ if resolved_import is not None else None,
                )
            )
        )

        if reference.generic is not None:
            temp_writer = NodeWriterImpl(
                should_format=False,
                should_format_as_snippet=False,
                whitelabel=False,
                should_include_header=False,
                reference_resolver=self,
            )

            resolved_reference += "["
            reference.generic.write(writer=temp_writer)
            resolved_reference += temp_writer.to_str()
            resolved_reference += "]"

        # Here we string-reference a type reference if the import is marked for `if TYPE_CHECKING` or if the import
        # is deferred until after the current declaration (e.g. for circular references when defining Pydantic models).
        return (
            f'"{resolved_reference}"'
            if reference.import_if_type_checking or reference.must_import_after_current_declaration
            else resolved_reference
        )

    def resolve_import(self, import_: AST.ReferenceImport) -> ResolvedImport:
        if self._original_import_to_resolved_import is None:
            raise RuntimeError("References have not yet been resolved.")
        return self._original_import_to_resolved_import[import_]

    def does_file_self_import(self) -> bool:
        return self._does_file_self_import

    def _construct_qualified_name_for_reference(self, reference: AST.Reference) -> AST.QualifiedName:
        return (
            self._construct_qualified_import_prefix_for_reference(reference.import_)
            + reference.qualified_name_excluding_import
        )

    def _construct_qualified_import_prefix_for_reference(
        self, import_: Optional[AST.ReferenceImport]
    ) -> AST.QualifiedName:
        if import_ is None:
            return ()
        if import_.alias is not None:
            return (import_.alias,)
        if import_.named_import is not None:
            return (import_.named_import,)
        if import_.module.is_local():
            raise RuntimeError("Import from local module is not a named import: " + ".".join(import_.module.path))
        return import_.module.path


def construct_import_alias_for_collision(reference_import: AST.ReferenceImport) -> str:
    parts = reference_import.module.path
    if reference_import.named_import is not None:
        parts += (reference_import.named_import,)
    if reference_import.alias is not None:
        parts += (reference_import.alias,)
    return "_".join(parts)
