from __future__ import annotations

from typing import List, Sequence, Set

from ....ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ....references import ClassReference, Reference
from ...reference_node import ReferenceNode
from ..function import FunctionDeclaration, FunctionParameter, FunctionSignature
from ..variable import VariableDeclaration
from .class_constructor import ClassConstructor
from .class_method_decorator import ClassMethodDecorator


class ClassDeclaration(AstNode):
    def __init__(self, name: str, extends: Sequence[ClassReference] = None, constructor: ClassConstructor = None):
        self.name = name
        self.extends = extends or []
        self.constructor = constructor
        self.statements: List[AstNode] = []
        self.ghost_references: Set[Reference] = set()

    def add_class_var(self, variable_declaration: VariableDeclaration) -> None:
        self.statements.append(variable_declaration)

    def add_method(
        self,
        declaration: FunctionDeclaration,
        decorator: ClassMethodDecorator = None,
        no_implicit_decorator: bool = False,
    ) -> FunctionDeclaration:
        def augment_signature(signature: FunctionSignature) -> FunctionSignature:
            parameters = (
                signature.parameters
                if decorator == ClassMethodDecorator.STATIC
                else [FunctionParameter(name="cls")] + list(signature.parameters)
                if decorator == ClassMethodDecorator.CLASS_METHOD
                else [FunctionParameter(name="self")] + list(signature.parameters)
            )

            return FunctionSignature(
                parameters=parameters,
                named_parameters=signature.named_parameters,
                return_type=signature.return_type,
                include_args=signature.include_args,
                include_kwargs=signature.include_kwargs,
            )

        decorators = (
            list(declaration.decorators)
            + [ReferenceNode(Reference(qualified_name_excluding_import=(decorator.value,)))]
            if decorator is not None and not no_implicit_decorator
            else declaration.decorators
        )

        declaration = FunctionDeclaration(
            name=declaration.name,
            signature=augment_signature(declaration.signature),
            body=declaration.body,
            decorators=decorators,
            overloads=[augment_signature(overload) for overload in declaration.overloads],
        )

        self.statements.append(declaration)

        return declaration

    def add_class(self, declaration: ClassDeclaration) -> None:
        self.statements.append(declaration)

    def add_ghost_reference(self, reference: Reference) -> None:
        self.ghost_references.add(reference)

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = {*self.extends, *self.ghost_references}
        if self.constructor is not None:
            references.update(self.constructor.get_references())
        for statement in self.statements:
            references.update(statement.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        if self.constructor is not None:
            generics.update(self.constructor.get_generics())
        for statement in self.statements:
            generics.update(statement.get_generics())
        return generics

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        top_line = f"class {self.name}"
        if len(self.extends) > 0:
            top_line += f"({', '.join(reference_resolver.resolve_reference(r) for r in self.extends)})"
        top_line += ":"
        writer.write_line(top_line)

        with writer.indent():
            for statement in self.statements:
                writer.write_node(statement)
            if len(self.statements) == 0:
                writer.write("pass")
            writer.write_line()
