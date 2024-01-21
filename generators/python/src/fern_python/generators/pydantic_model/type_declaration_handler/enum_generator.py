from typing import Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.snippet import SnippetWriter

from ...context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abstract_type_generator import AbstractTypeGenerator
from .get_visit_method import VisitableItem, get_visit_method


class EnumGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        enum: ir_types.EnumTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        snippet: Optional[str] = None,
    ):
        super().__init__(
            context=context, custom_config=custom_config, source_file=source_file, docs=docs, snippet=snippet
        )
        self._name = name
        self._enum = enum

    def generate(self) -> None:
        enum_class = AST.ClassDeclaration(
            name=self._get_class_name(),
            extends=[
                AST.ClassReference(
                    qualified_name_excluding_import=("str",),
                ),
                AST.ClassReference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("enum",))),
                    qualified_name_excluding_import=("Enum",),
                ),
            ],
            docstring=AST.Docstring(self._docs) if self._docs is not None else None,
            snippet=self._snippet,
        )

        self._source_file.add_class_declaration(enum_class)

        for value in self._enum.values:
            enum_class.add_class_var(
                AST.VariableDeclaration(
                    name=get_class_var_name(value.name.name),
                    initializer=AST.Expression(f'"{value.name.wire_value}"'),
                    docstring=AST.Docstring(value.docs) if value.docs is not None else None,
                )
            )

        enum_class.add_method(
            get_visit_method(
                items=[
                    VisitableItem(
                        parameter_name=self._get_visitor_parameter_name_for_enum_value(value),
                        expected_value=f"{self._get_class_name()}.{get_class_var_name(value.name.name)}",
                        visitor_argument=None,
                    )
                    for value in self._enum.values
                ],
                reference_to_current_value="self",
                should_use_is_for_equality_check=True,
            )
        )

    def _get_visitor_parameter_name_for_enum_value(self, enum_value: ir_types.EnumValue) -> str:
        return enum_value.name.name.snake_case.safe_name

    def _get_class_name(self) -> str:
        return self._name.name.pascal_case.unsafe_name


class EnumSnippetGenerator:
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleEnumType,
    ):
        self.snippet_writer = snippet_writer
        self.name = name
        self.example = example

    def generate_snippet(self) -> AST.Expression:
        class_reference = self.snippet_writer.get_class_reference_for_declared_type_name(
            name=self.name,
        )

        def write_enum(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(class_reference))
            writer.write(f".{get_class_var_name(self.example.value.name)}")

        return AST.Expression(AST.CodeWriter(write_enum))


def get_class_var_name(name: ir_types.Name) -> str:
    return name.screaming_snake_case.unsafe_name
