from __future__ import annotations

from typing import List, Optional, Sequence

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
from ordered_set import OrderedSet


class ClassDeclaration(AstNode):
    def __init__(
        self,
        name: str,
        is_abstract: bool = False,
        extends: Sequence[ClassReference] = [],
        constructor: Optional[ClassConstructor] = None,
        docstring: Optional[Docstring] = None,
        snippet: Optional[str] = None,
        write_parameter_docstring: bool = False,
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
        self.snippet = snippet
        self.class_vars: List[VariableDeclaration] = []
        self.statements: List[AstNode] = []
        self.ghost_references: OrderedSet[Reference] = OrderedSet([])
        self.write_parameter_docstring = write_parameter_docstring

    def add_class_var(self, variable_declaration: VariableDeclaration) -> None:
        self.class_vars.append(variable_declaration)

    def add_method(
        self,
        declaration: FunctionDeclaration,
        decorator: Optional[ClassMethodDecorator] = None,
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
            is_async=declaration.is_async,
        )

        self.statements.append(declaration)

        return declaration

    def add_abstract_method(
        self,
        name: str,
        signature: FunctionSignature,
        docstring: Optional[Docstring] = None,
        is_async: bool = False,
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
                is_async=is_async,
            )
        )

    def add_class(self, declaration: ClassDeclaration) -> None:
        self.statements.append(declaration)

    def add_snippet(self, snippet: str) -> None:
        self.snippet = snippet

    def add_statement(self, statement: AstNode) -> None:
        self.statements.append(statement)

    def add_ghost_reference(self, reference: Reference) -> None:
        self.ghost_references.add(reference)

    def get_ghost_references(self) -> OrderedSet[Reference]:
        return self.ghost_references

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.declarations.add(self.name)
        metadata.references.update(self.extends)
        metadata.references.update(self.ghost_references)
        if self.constructor is not None:
            metadata.update(self.constructor.get_metadata())
        for class_var in self.class_vars:
            metadata.update(class_var.get_metadata())
        for statement in self.statements:
            metadata.update(statement.get_metadata())
        if self.docstring is not None:
            metadata.update(self.docstring.get_metadata())
        return metadata

    def add_expression(self, expression: Expression) -> None:
        self.statements.append(expression)

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
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
            parameters = (
                self.constructor.function_declaration.signature.named_parameters if self.constructor is not None else []
            )
            if (
                self.docstring is not None
                or self.snippet is not None
                or (len(parameters) > 0 and self.write_parameter_docstring)
            ):
                writer.write_line('"""')

            if self.docstring is not None:
                writer.write_node(self.docstring)
                writer.write_newline_if_last_line_not()
                if self.snippet is None and len(parameters) == 0:
                    writer.write_line('"""')
                elif len(parameters) == 0:
                    writer.write_line()

            if len(parameters) > 0 and self.write_parameter_docstring:
                if self.docstring is not None:
                    # Include a line between the endpoint docs and field docs.
                    writer.write_line()
                writer.write_line("Parameters")
                writer.write_line("----------")
                for i, param in enumerate(parameters):
                    if i > 0:
                        writer.write_line()
                    writer.write(f"{param.name} : ")
                    if param.type_hint is not None:
                        writer.write_node(param.type_hint)
                    if param.docs is not None:
                        split = param.docs.split("\n")
                        with writer.indent():
                            for i, line in enumerate(split):
                                writer.write(line)
                                if i < len(split) - 1:
                                    writer.write_line()

                                if self.snippet is None:
                                    writer.write_line('"""')
                                else:
                                    writer.write_line()
                writer.write_line()

            if self.snippet is not None:
                writer.write_line("Examples")
                writer.write_line("--------")
                writer.write(self.snippet)
                writer.write_newline_if_last_line_not()
                writer.write_line('"""')

            did_write_statement = False
            for class_var in self.class_vars:
                writer.write_node(class_var)
                writer.write_newline_if_last_line_not()
                did_write_statement = True
            if self.constructor is not None:
                writer.write_node(self.constructor)
                writer.write_newline_if_last_line_not()
                did_write_statement = True
            for statement in self.statements:
                writer.write_line()
                writer.write_node(statement)
                writer.write_newline_if_last_line_not()
                did_write_statement = True
            if not did_write_statement:
                writer.write("pass")
