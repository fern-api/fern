from collections import defaultdict
from dataclasses import dataclass
from typing import DefaultDict, Sequence, Set

from . import AST
from .reference_resolver_impl import ReferenceResolverImpl
from .top_level_statement import StatementId, TopLevelStatement


@dataclass(frozen=True)
class StatementIdAndConstraint:
    statement_id: StatementId
    constraint: AST.ImportConstraint


class ImportsManager:
    def __init__(self, project_name: str):
        self._project_name = project_name
        self._statement_to_imports_that_must_come_before_it: DefaultDict[
            StatementId, Set[AST.ReferenceImport]
        ] = defaultdict(set)
        self._import_to_constraints: DefaultDict[AST.ReferenceImport, Set[StatementIdAndConstraint]] = defaultdict(set)

    def resolve_constraints(self, statements: Sequence[TopLevelStatement]) -> None:
        for statement in statements:
            for reference in statement.references:
                if reference.import_ is not None:

                    if reference.import_.constaint is not None:
                        self._import_to_constraints[reference.import_].add(
                            StatementIdAndConstraint(
                                statement_id=statement.id,
                                constraint=reference.import_.constaint,
                            )
                        )
                        if reference.import_.constaint == AST.ImportConstraint.BEFORE_CURRENT_DECLARATION:
                            self._statement_to_imports_that_must_come_before_it[statement.id].add(reference.import_)
                    else:
                        # even if there's no constraints, we still add the
                        # import to the defaultdict so we write it to the file
                        self._import_to_constraints[reference.import_]

    def write_top_imports_for_statement(
        self, statement: TopLevelStatement, writer: AST.Writer, reference_resolver: ReferenceResolverImpl
    ) -> None:
        # find all imports where the constraint is "must be before {statement}"
        imports_constrained_to_before_statement = self._statement_to_imports_that_must_come_before_it[statement.id]

        # clear all constraints from these imports.
        # if any of them have "must be after {different statement}", raise an error
        for import_ in imports_constrained_to_before_statement:
            for constraint_for_import in self._import_to_constraints[import_]:
                if constraint_for_import.constraint == AST.ImportConstraint.BEFORE_CURRENT_DECLARATION:
                    self._statement_to_imports_that_must_come_before_it[constraint_for_import.statement_id].remove(
                        import_
                    )
                else:
                    raise RuntimeError(
                        f"Import is constrained to be before statement {statement.id}"
                        + f" but after later statement {constraint_for_import.statement_id}"
                    )

            self._import_to_constraints[import_] = set()

        # write (and forget) all imports without constraints
        written_imports: Set[AST.ReferenceImport] = set()
        for import_, constraints in self._import_to_constraints.items():
            if len(constraints) == 0:
                self._write_import(import_=import_, writer=writer, reference_resolver=reference_resolver)
                written_imports.add(import_)
        for import_ in written_imports:
            del self._import_to_constraints[import_]

        # delete "must be after {statement} constraints"
        constraint_to_delete = StatementIdAndConstraint(
            statement_id=statement.id,
            constraint=AST.ImportConstraint.AFTER_CURRENT_DECLARATION,
        )
        for import_, constraints in self._import_to_constraints.items():
            if constraint_to_delete in constraints:
                constraints.remove(constraint_to_delete)

    def write_remaining_imports(self, writer: AST.Writer, reference_resolver: ReferenceResolverImpl) -> None:
        for import_ in self._import_to_constraints:
            self._write_import(import_=import_, writer=writer, reference_resolver=reference_resolver)

    def _write_import(
        self, import_: AST.ReferenceImport, writer: AST.Writer, reference_resolver: ReferenceResolverImpl
    ) -> None:
        resolved_import = reference_resolver.resolve_import(import_)
        module_str = ".".join(
            resolved_import.module.get_fully_qualfied_module_path(
                project_name=self._project_name,
            )
        )
        if resolved_import.named_import is None:
            writer.write(f"import {module_str}")
        else:
            writer.write(f"from {module_str} import {resolved_import.named_import}")
        if resolved_import.alias is not None:
            writer.write(f" as {resolved_import.alias}")
        writer.write("\n")
