from __future__ import annotations

from abc import ABC, abstractmethod
from types import TracebackType
from typing import Callable, List, Optional, Set, Type

from . import AST
from .imports_manager import ImportsManager
from .node_writer_impl import NodeWriterImpl
from .reference_resolver_impl import ReferenceResolverImpl


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
        class_name: str,
        extends: List[AST.ClassReference] = [],
        do_not_export: bool = False,
    ) -> AST.ClassDeclaration:
        class_declaration = AST.ClassDeclaration(name=class_name, extends=extends)
        self._statements.append(class_declaration)
        if not do_not_export:
            self._exports.add(class_name)
        return class_declaration

    def finish(self) -> None:
        for statement in self._statements:
            for reference in statement.get_references():
                self._reference_resolver.register_reference(reference)
        self._reference_resolver.resolve_references()

        for reference in self._reference_resolver.get_resolved_references():
            if reference.module != self._module_path:
                self._imports_manager.register_import(reference)

        with NodeWriterImpl(filepath=self._filepath, reference_resolver=self._reference_resolver) as writer:
            for statement in self._statements:
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
