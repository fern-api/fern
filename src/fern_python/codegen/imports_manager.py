from collections import defaultdict
from typing import DefaultDict, Sequence, Set

from . import AST
from .reference_resolver_impl import ReferenceResolverImpl
from .top_level_statement import StatementId, TopLevelStatement


class ImportsManager:
    def __init__(self, project_name: str):
        self._project_name = project_name
        self._import_to_statements_that_must_precede_it: DefaultDict[
            AST.ReferenceImport, Set[StatementId]
        ] = defaultdict(set)

        self._postponed_annotations = False

        self._has_resolved_constraints = False
        self._has_written_top_imports = False

    def resolve_constraints(self, statements: Sequence[TopLevelStatement]) -> None:
        for statement in statements:
            for reference in statement.references:
                if reference.import_ is not None:
                    if reference.import_.must_import_after_current_declaration:
                        self._import_to_statements_that_must_precede_it[reference.import_].add(statement.id)
                        self._postponed_annotations = True
                    elif reference.import_ not in self._import_to_statements_that_must_precede_it:
                        # even if there's no constraints, we still store the import
                        # so that we write it to the file.
                        self._import_to_statements_that_must_precede_it[reference.import_] = set()

        self._has_resolved_constraints = True

    def write_top_imports_for_file(self, writer: AST.Writer) -> None:
        if not self._has_resolved_constraints:
            raise RuntimeError("Constraints haven't been resolved yet")
        if self._postponed_annotations:
            writer.write_line("from __future__ import annotations")
        self._has_written_top_imports = True

    def write_top_imports_for_statement(
        self, statement: TopLevelStatement, writer: AST.Writer, reference_resolver: ReferenceResolverImpl
    ) -> None:
        if not self._has_written_top_imports:
            raise RuntimeError("Top imports haven't been written yet")

        # write (and forget) all imports that have no constraints
        written_imports: Set[AST.ReferenceImport] = set()
        for import_, statements_that_must_precede_it in self._import_to_statements_that_must_precede_it.items():
            if len(statements_that_must_precede_it) == 0:
                self._write_import(import_=import_, writer=writer, reference_resolver=reference_resolver)
                written_imports.add(import_)
            else:
                statements_that_must_precede_it.remove(statement.id)
        for import_ in written_imports:
            del self._import_to_statements_that_must_precede_it[import_]

    def write_remaining_imports(self, writer: AST.Writer, reference_resolver: ReferenceResolverImpl) -> None:
        for import_ in self._import_to_statements_that_must_precede_it:
            self._write_import(import_=import_, writer=writer, reference_resolver=reference_resolver)

    def _write_import(
        self, import_: AST.ReferenceImport, writer: AST.Writer, reference_resolver: ReferenceResolverImpl
    ) -> None:
        writer.write_line(self._get_import_as_string(import_=import_, reference_resolver=reference_resolver))

    def _get_import_as_string(self, import_: AST.ReferenceImport, reference_resolver: ReferenceResolverImpl) -> str:
        resolved_import = reference_resolver.resolve_import(import_)
        module_str = ".".join(
            resolved_import.module.get_fully_qualfied_module_path(
                project_name=self._project_name,
            )
        )

        if resolved_import.named_import is None:
            s = f"import {module_str}"
        else:
            s = f"from {module_str} import {resolved_import.named_import}"
        if resolved_import.alias is not None:
            s += f" as {resolved_import.alias}"

        return s
