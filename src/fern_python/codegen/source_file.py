from __future__ import annotations

from abc import ABC, abstractmethod
from types import TracebackType
from typing import Callable, List, Optional, Set, Type, TypeVar

from . import AST
from .imports_manager import ImportsManager
from .node_writer_impl import NodeWriterImpl
from .reference_resolver_impl import ReferenceResolverImpl

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
        completion_listener: Callable[[SourceFileImpl], None] = None,
    ):
        self._filepath = filepath
        self._module_path = module_path
        self._imports_manager = ImportsManager()
        self._reference_resolver = reference_resolver
        self._completion_listener = completion_listener
        self._statements: List[AST.AstNode] = []
        self._statements_after_bottom_imports: List[AST.AstNode] = []
        self._exports: Set[str] = set()

    def add_declaration(
        self,
        declaration: AST.Declaration,
        do_not_export: bool = False,
    ) -> None:
        self._statements.append(declaration)
        if declaration.name is not None:
            self._exports.add(declaration.name)

    def add_arbitrary_code(self, code: AST.CodeWriter, after_bottom_imports: bool = False) -> None:
        if after_bottom_imports:
            self._statements_after_bottom_imports.append(code)
        else:
            self._statements.append(code)

    def finish(self) -> None:
        self._add_generics_declarations()
        self._register_imports()

        with NodeWriterImpl(filepath=self._filepath, reference_resolver=self._reference_resolver) as writer:
            self._imports_manager.write_top_imports(writer=writer)

            for statement in self._statements:
                writer.write_node(statement)

            self._imports_manager.write_bottom_imports(writer=writer)

            for statement in self._statements_after_bottom_imports:
                writer.write_node(statement)

        if self._completion_listener is not None:
            self._completion_listener(self)

    def _register_imports(self) -> None:
        for statement in self._statements:
            for reference in statement.get_references():
                self._reference_resolver.register_reference(reference)
        self._reference_resolver.resolve_references()

        for reference in self._reference_resolver.get_resolved_references():
            if reference.import_ is not None and reference.import_.module != self._module_path:
                self._imports_manager.register_import(reference.import_)

    def _add_generics_declarations(self) -> None:
        generics_declarations: List[AST.AstNode] = [
            AST.VariableDeclaration(
                name=generic.name,
                initializer=AST.FunctionInvocation(
                    function_definition=AST.Reference(
                        import_=AST.ReferenceImport(module=("typing",)),
                        qualified_name_excluding_import=("TypeVar",),
                    ),
                    args=[AST.CodeWriter(f'"{generic.name}"')],
                ),
            )
            for generic in self._get_generics()
        ]
        self._statements = generics_declarations + self._statements

    def _get_generics(self) -> Set[AST.GenericTypeVar]:
        generics: Set[AST.GenericTypeVar] = set()
        for statement in self._statements:
            generics.update(statement.get_generics())
        return generics

    def get_exports(self) -> Set[str]:
        return self._exports

    def __enter__(self) -> SourceFile:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()
