from __future__ import annotations

from typing import List, Sequence, Set

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import ClassReference, Module, Reference, ReferenceImport
from ...code_writer import CodeWriter
from ...docstring import Docstring
from ...expressions import Expression
from ...reference_node import ReferenceNode
from ..function import FunctionDeclaration, FunctionParameter, FunctionSignature
from ..variable import VariableDeclaration
from .class_constructor import ClassConstructor
from .class_method_decorator import ClassMethodDecorator


class ClassDeclaration(AstNode):
    def __init__(
        self,
        name: str,
        is_abstract: bool = False,
        extends: Sequence[ClassReference] = None,
        constructor: ClassConstructor = None,
        docstring: Docstring = None,
    ):
        self.name = name
        self.extends = list(extends or [])
        if is_abstract:
            self.extends.insert(
                0,
                ClassReference(
                    qualified_name_excluding_import=("ABC",),
                    import_=ReferenceImport(module=Module.built_in(("abc",))),
                ),
            )
        self.constructor = constructor
        self.docstring = docstring
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
            docstring=declaration.docstring,
        )

        self.statements.append(declaration)

        return declaration

    def add_abstract_method(
        self,
        name: str,
        signature: FunctionSignature,
        docstring: Docstring = None,
    ) -> FunctionDeclaration:
        return self.add_method(
            declaration=FunctionDeclaration(
                name=name,
                signature=signature,
                body=CodeWriter("..."),
                decorators=[
                    ReferenceNode(
                        Reference(
                            qualified_name_excluding_import=("abstractmethod",),
                            import_=ReferenceImport(module=Module.built_in(("abc",))),
                        )
                    )
                ],
                docstring=docstring,
            )
        )

    def add_class(self, declaration: ClassDeclaration) -> None:
        self.statements.append(declaration)

    def add_ghost_reference(self, reference: Reference) -> None:
        self.ghost_references.add(reference)

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.declarations.add(self.name)
        metadata.references.update({*self.extends, *self.ghost_references})
        if self.constructor is not None:
            metadata.update(self.constructor.get_metadata())
        for statement in self.statements:
            metadata.update(statement.get_metadata())
        if self.docstring is not None:
            metadata.update(self.docstring.get_metadata())
        return metadata

    def add_expression(self, expression: Expression) -> None:
        self.statements.append(expression)

    def write(self, writer: NodeWriter) -> None:
        writer.write(f"class {self.name}")

        just_wrote_extension = False
        if len(self.extends) > 0:
            writer.write("(")
            for extension in self.extends:
                if just_wrote_extension:
                    writer.write(", ")
                writer.write_reference(extension)
                just_wrote_extension = True
            writer.write(")")
        writer.write_line(":")

        with writer.indent():
            if self.docstring is not None:
                writer.write_line('"""')
                writer.write_node(self.docstring)
                writer.write_newline_if_last_line_not()
                writer.write_line('"""')

            did_write_statement = False
            if self.constructor is not None:
                writer.write_node(self.constructor)
                writer.write_newline_if_last_line_not()
                did_write_statement = True
            for statement in self.statements:
                writer.write_node(statement)
                writer.write_newline_if_last_line_not()
                did_write_statement = True
            if not did_write_statement:
                writer.write("pass")
