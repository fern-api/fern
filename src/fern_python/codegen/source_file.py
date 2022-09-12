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
    def add_class(
        self,
        class_name: str,
        extends: List[AST.ClassReference] = [],
        do_not_export: bool = False,
    ) -> AST.ClassDeclaration:
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
    _filepath: str
    _module_path: AST.ModulePath
    _imports_manager = ImportsManager()
    _reference_resolver: ReferenceResolverImpl
    _statements: List[AST.AstNode] = []
    _statements_after_bottom_imports: List[AST.AstNode] = []
    _exports: Set[str] = set()
    _completion_listener: Optional[Callable[[SourceFileImpl], None]]

    def __init__(
        self,
        filepath: str,
        module_path: AST.ModulePath,
        reference_resolver: ReferenceResolverImpl,
        completion_listener: Callable[[SourceFileImpl], None] = None,
    ):
        self._filepath = filepath
        self._module_path = module_path
        self._reference_resolver = reference_resolver
        self._completion_listener = completion_listener

    def add_class(
        self,
        name: str,
        extends: List[AST.ClassReference] = [],
        do_not_export: bool = False,
    ) -> AST.ClassDeclaration:
        declaration = AST.ClassDeclaration(name=name, extends=extends)
        return self._add_statement(statement=declaration, exported_name=name if not do_not_export else None)

    def add_function(
        self,
        name: str,
        parameters: List[AST.FunctionParameter],
        return_type: AST.TypeHint,
        body: AST.CodeWriter,
        do_not_export: bool = False,
    ) -> AST.FunctionDeclaration:
        declaration = AST.FunctionDeclaration(name=name, return_type=return_type, parameters=parameters, body=body)
        return self._add_statement(statement=declaration, exported_name=name if not do_not_export else None)

    def add_arbitrary_code(self, code: AST.CodeWriter, after_bottom_imports: bool = False) -> None:
        if after_bottom_imports:
            self._statements_after_bottom_imports.append(code)
        else:
            self._statements.append(code)

    def _add_statement(
        self,
        statement: T_AstNode,
        exported_name: Optional[str],
    ) -> T_AstNode:
        self._statements.append(statement)
        if exported_name is not None:
            self._exports.add(exported_name)
        return statement

    def finish(self) -> None:
        for statement in self._statements:
            for reference in statement.get_references():
                self._reference_resolver.register_reference(reference)

        for reference in self._reference_resolver.get_resolved_references():
            if reference.module != self._module_path:
                self._imports_manager.register_import(reference)

        with NodeWriterImpl(filepath=self._filepath, reference_resolver=self._reference_resolver) as writer:
            self._imports_manager.write_top_imports(writer=writer)
            for statement in self._statements:
                writer.write_node(statement)
            self._imports_manager.write_bottom_imports(writer=writer)
            for statement in self._statements_after_bottom_imports:
                writer.write_node(statement)

        if self._completion_listener is not None:
            self._completion_listener(self)

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
