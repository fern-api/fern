from collections import defaultdict
from typing import DefaultDict, Set

from . import AST
from .reference_resolver import ReferenceResolver
from .reference_resolver_impl import ReferenceResolverImpl
from .top_level_statement import StatementId
from fern_python.codegen.ast.nodes.type_hint.type_hint import TYPING_REFERENCE_IMPORT
from ordered_set import OrderedSet


class ImportsManager:
    def __init__(self, module_path: AST.ModulePath) -> None:
        self._module_path = module_path

        self._import_to_statements_that_must_precede_it: DefaultDict[AST.ReferenceImport, OrderedSet[StatementId]] = (
            defaultdict(OrderedSet)
        )

        self._bottom_imports: DefaultDict[AST.ReferenceImport, OrderedSet[None]] = defaultdict(OrderedSet)
        self._if_type_checking_imports: DefaultDict[AST.ReferenceImport, OrderedSet[None]] = defaultdict(OrderedSet)

        self._postponed_annotations = False
        self._has_written_top_imports = False
        self._has_written_any_statements = False

    def resolve_constraints(self, *, statement_id: StatementId, references: OrderedSet[AST.Reference]) -> None:
        for reference in references:
            if reference.is_forward_reference:
                self._postponed_annotations = True
            if reference.import_ is not None:
                if reference.require_postponed_annotations:
                    self._postponed_annotations = True

                if reference.must_import_after_current_declaration:
                    self._import_to_statements_that_must_precede_it[reference.import_].add(statement_id)
                    self._postponed_annotations = True
                elif reference.import_if_type_checking:
                    self._if_type_checking_imports[reference.import_].add(None)
                    self._postponed_annotations = True
                elif reference.import_.alternative_import is not None:
                    self._bottom_imports[reference.import_].add(None)
                elif reference.import_ not in self._import_to_statements_that_must_precede_it:
                    # even if there's no constraints, we still store the import
                    # so that we write it to the file.
                    self._import_to_statements_that_must_precede_it[reference.import_] = OrderedSet()

    def write_top_imports_for_file(self, writer: AST.Writer, reference_resolver: ReferenceResolverImpl) -> None:
        if self._postponed_annotations or reference_resolver.does_file_self_import():
            writer.write_line("from __future__ import annotations")
        self._has_written_top_imports = True

    def write_top_imports_for_statement(
        self, *, statement_id: StatementId, writer: AST.NodeWriter, reference_resolver: ReferenceResolver
    ) -> None:
        if not self._has_written_top_imports:
            raise RuntimeError("Top imports haven't been written yet")

        # write (and forget) all imports that have no constraints
        written_imports: Set[AST.ReferenceImport] = set()
        for import_, statements_that_must_precede_it in self._import_to_statements_that_must_precede_it.items():
            if len(statements_that_must_precede_it) == 0:
                self._write_import(import_=import_, writer=writer, reference_resolver=reference_resolver)
                written_imports.add(import_)
            elif statement_id in statements_that_must_precede_it:
                statements_that_must_precede_it.remove(statement_id)
        for import_ in written_imports:
            del self._import_to_statements_that_must_precede_it[import_]

        # write all the imports that must be un-type checked (e.g. for circular references)
        # to ensure we're not writing `if TYPE_CHECKING` without any imports, we first resolve
        # all the imports to see if the preamble should be written.
        include_type_checking_imports = False
        for import_, _ in self._if_type_checking_imports.items():
            ensure_valid_reference = reference_resolver.resolve_import(import_)
            if ensure_valid_reference.import_ is not None:
                include_type_checking_imports = True
        if len(self._if_type_checking_imports.items()) > 0 and include_type_checking_imports:
            self._write_import(import_=TYPING_REFERENCE_IMPORT, writer=writer, reference_resolver=reference_resolver)
            writer.write("if ")
            writer.write_node(AST.TypeHint.type_checking())
            writer.write_line(":")
            with writer.indent():
                un_type_checked_written_imports: Set[AST.ReferenceImport] = set()
                for import_, _ in self._if_type_checking_imports.items():
                    self._write_import(import_=import_, writer=writer, reference_resolver=reference_resolver)
                    un_type_checked_written_imports.add(import_)
            for import_ in un_type_checked_written_imports:
                del self._if_type_checking_imports[import_]

        bottom_written_imports: Set[AST.ReferenceImport] = set()
        for import_, _ in self._bottom_imports.items():
            self._write_import(import_=import_, writer=writer, reference_resolver=reference_resolver)
            bottom_written_imports.add(import_)
        for import_ in bottom_written_imports:
            del self._bottom_imports[import_]

        self._has_written_any_statements = True

    def write_remaining_imports(self, writer: AST.NodeWriter, reference_resolver: ReferenceResolver) -> None:
        for import_ in self._import_to_statements_that_must_precede_it:
            self._write_import(import_=import_, writer=writer, reference_resolver=reference_resolver)

    def _write_import(
        self, import_: AST.ReferenceImport, writer: AST.NodeWriter, reference_resolver: ReferenceResolver
    ) -> None:
        resolved_import = reference_resolver.resolve_import(import_)
        if resolved_import.import_ is not None:
            writer.write_line(
                self.get_import_as_string(
                    import_=resolved_import.import_,
                )
            )

    def get_resolved_import_as_string(
        self, import_: AST.ReferenceImport, reference_resolver: ReferenceResolver, noqas: list[str] = []
    ) -> str:
        resolved_import = reference_resolver.resolve_import(import_)
        if resolved_import.import_ is not None:
            return self.get_import_as_string(import_=resolved_import.import_, noqas=noqas)
        raise RuntimeError("Import is not resolved")

    def get_import_as_string(self, import_: AST.ReferenceImport, noqas: list[str] = []) -> str:
        module_str = (
            get_relative_module_path_str(
                from_module=self._module_path,
                to_module=import_.module.path,
            )
            if import_.module.is_local()
            else ".".join(import_.module.path)
        )

        if import_.named_import is None:
            s = f"import {module_str}"
        else:
            s = f"from {module_str} import {import_.named_import}"
        if import_.alias is not None:
            s += f" as {import_.alias}"

        if noqas:
            s += " # noqa: " + ", ".join(noqas)
        elif self._has_written_any_statements:
            s += " # noqa: E402, F401, I001"

        if import_.alternative_import is not None:
            alternative_import = self.get_import_as_string(import_.alternative_import)
            s = f"""
try:
    {s} # type: ignore
except ImportError:
    {alternative_import} # type: ignore
            """

        return s


def get_relative_module_path_str(from_module: AST.ModulePath, to_module: AST.ModulePath) -> str:
    s = "."

    # walk back from the from_module until we get to a common ancestor
    index = len(from_module) - 2
    while index >= 0:
        if index >= len(to_module) or to_module[: index + 1] != from_module[: index + 1]:
            s += "."
        else:
            break
        index -= 1

    # `index` is now the index of the common ancestor between 'from' and 'to'.
    # new parts to include in the relative path start at `index + 1`

    # ignore flake warning https://black.readthedocs.io/en/stable/the_black_code_style/current_style.html#slices
    s += ".".join(to_module[index + 1 :])  # noqa: E203

    return s
