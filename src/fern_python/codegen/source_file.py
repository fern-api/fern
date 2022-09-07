from typing import List

from . import AST
from .imports_manager import ImportsManager
from .reference_resolver_impl import ReferenceResolverImpl
from .writer_impl import WriterImpl


class SourceFile:
    _module_path: AST.ModulePath
    _imports_manager = ImportsManager()
    _reference_resolver: ReferenceResolverImpl
    _statements: List[AST.AstNode] = []

    def __init__(self, module_path: AST.ModulePath):
        self._module_path = module_path
        self._reference_resolver = ReferenceResolverImpl(module_path=self._module_path)

    def add_class(self, class_name: str, extends: List[AST.ClassReference] = []) -> AST.ClassDeclaration:
        class_declaration = AST.ClassDeclaration(name=class_name, extends=extends)
        self._statements.append(class_declaration)
        return class_declaration

    def write(self) -> None:
        for statement in self._statements:
            for reference in statement.get_references():
                self._reference_resolver.register_reference(reference)
        self._reference_resolver.resolve_references()

        for reference in self._reference_resolver.get_resolved_references():
            if reference.module != self._module_path:
                self._imports_manager.register_import(reference)

        with WriterImpl(filepath="./test.py", reference_resolver=self._reference_resolver) as writer:
            for statement in self._statements:
                writer.write_node(statement)
