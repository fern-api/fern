from __future__ import annotations

from abc import ABC, abstractmethod
from types import TracebackType
from typing import Callable, List, Optional, Set, Type, TypeVar

from . import AST
from .imports_manager import ImportsManager
from .node_writer_impl import NodeWriterImpl
from .reference_resolver_impl import ReferenceResolverImpl
from .top_level_statement import TopLevelStatement

T_AstNode = TypeVar("T_AstNode", bound=AST.AstNode)


class SourceFile(ABC):
    @abstractmethod
    def add_declaration(
        self,
        declaration: AST.Declaration,
        do_not_export: bool = False,
    ) -> None:
        ...

    @abstractmethod
    def add_arbitrary_code(self, code: AST.CodeWriter) -> None:
        ...

    @abstractmethod
    def add_footer_expression(self, expression: AST.Expression) -> None:
        ...

    @abstractmethod
    def finish(self) -> None:
        ...

    @abstractmethod
    def __enter__(self) -> SourceFile:
        ...

    @abstractmethod
    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        ...


class SourceFileImpl(SourceFile):
    def __init__(
        self,
        filepath: str,
        module_path: AST.ModulePath,
        reference_resolver: ReferenceResolverImpl,
        imports_manager: ImportsManager,
        completion_listener: Callable[[SourceFileImpl], None] = None,
    ):
        self._filepath = filepath
        self._module_path = module_path
        self._reference_resolver = reference_resolver
        self._imports_manager = imports_manager
        self._completion_listener = completion_listener
        self._statements: List[TopLevelStatement] = []
        self._exports: Set[str] = set()
        self._footer_statements: List[TopLevelStatement] = []

    def add_declaration(
        self,
        declaration: AST.Declaration,
        do_not_export: bool = False,
    ) -> None:
        self._statements.append(TopLevelStatement(node=declaration, id=declaration.name))
        if declaration.name is not None:
            self._exports.add(declaration.name)

    def add_arbitrary_code(self, code: AST.CodeWriter) -> None:
        self._statements.append(TopLevelStatement(node=code))

    def add_footer_expression(self, expression: AST.Expression) -> None:
        self._footer_statements.append(TopLevelStatement(node=expression))

    def finish(self) -> None:
        self._prepend_generics_declarations_to_statements()
        self._resolve_references()
        self._imports_manager.resolve_constraints(statements=self._get_all_statements())

        with NodeWriterImpl(filepath=self._filepath, reference_resolver=self._reference_resolver) as writer:
            self._imports_manager.write_top_imports_for_file(writer=writer)
            for statement in self._statements:
                self._imports_manager.write_top_imports_for_statement(
                    statement=statement,
                    writer=writer,
                    reference_resolver=self._reference_resolver,
                )
                writer.write_node(statement.node)
            self._imports_manager.write_remaining_imports(
                writer=writer,
                reference_resolver=self._reference_resolver,
            )
            for statement in self._footer_statements:
                writer.write_node(node=statement.node)

        if self._completion_listener is not None:
            self._completion_listener(self)

    def get_exports(self) -> Set[str]:
        return self._exports

    def _get_all_statements(self) -> List[TopLevelStatement]:
        return self._statements + self._footer_statements

    def _prepend_generics_declarations_to_statements(self) -> None:
        generics_declarations: List[TopLevelStatement] = [
            TopLevelStatement(
                id=generic.name,
                node=AST.VariableDeclaration(
                    name=generic.name,
                    initializer=AST.FunctionInvocation(
                        function_definition=AST.Reference(
                            import_=AST.ReferenceImport(module=AST.Module.built_in("typing")),
                            qualified_name_excluding_import=("TypeVar",),
                        ),
                        args=[AST.CodeWriter(f'"{generic.name}"')],
                    ),
                ),
            )
            for generic in self._get_generics()
        ]
        self._statements = generics_declarations + self._statements

    def _get_generics(self) -> Set[AST.GenericTypeVar]:
        generics: Set[AST.GenericTypeVar] = set()
        for statement in self._get_all_statements():
            generics.update(statement.node.get_generics())
        return generics

    def _resolve_references(self) -> None:
        for statement in self._get_all_statements():
            for reference in statement.references:
                self._reference_resolver.register_reference(reference)
        self._reference_resolver.resolve_references()

    def __enter__(self) -> SourceFile:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()
