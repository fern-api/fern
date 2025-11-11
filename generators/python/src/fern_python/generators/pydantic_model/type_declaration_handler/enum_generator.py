from typing import Optional, Union

from ...context.pydantic_generator_context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abc.abstract_type_generator import AbstractTypeGenerator
from .get_visit_method import VisitableItem, VisitorArgument, get_visit_method
from fern_python.codegen import AST, SourceFile
from fern_python.generators.pydantic_model.type_declaration_handler.abc.abstract_type_snippet_generator import (
    AbstractTypeSnippetGenerator,
)
from fern_python.snippet import SnippetWriter

import fern.ir.resources as ir_types


# Note enums are the same for both pydantic models and typeddicts os the generator is not multiplexed
class EnumGenerator(AbstractTypeGenerator):
    UNKNOWN_MEMBER_NAME = "_UNKNOWN"

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
        self._enum_type = custom_config.enum_type
        self._use_str_enums = custom_config.use_str_enums or self._enum_type == "literals"
        self._class_name = context.get_class_name_for_type_id(name.type_id, as_request=False)
        self._name = name
        self._enum = enum

    def generate(self) -> None:
        if self._use_str_enums:
            # Create a list of string literals for enum values
            enum_literals = []
            for v in self._enum.values:
                escaped_value = v.name.wire_value.replace("\\", "\\\\").replace('"', '\\"')
                enum_literals.append(f'"{escaped_value}"')

            # Join the literals with commas
            literals_expression = AST.Expression(", ".join(enum_literals))

            # Create the type alias declaration
            type_alias = AST.TypeAliasDeclaration(
                type_hint=AST.TypeHint.union(
                    AST.TypeHint.literal(literals_expression),
                    AST.TypeHint.any(),
                ),
                name=self._class_name,
            )

            self._source_file.add_declaration(
                type_alias,
                should_export=True,
            )
        else:
            enum_class = AST.ClassDeclaration(
                name=self._class_name,
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
                escaped_value = value.name.wire_value.replace("\\", "\\\\").replace('"', '\\"')
                enum_class.add_class_var(
                    AST.VariableDeclaration(
                        name=_get_class_var_name(value.name.name),
                        initializer=AST.Expression(f'"{escaped_value}"'),
                        docstring=AST.Docstring(value.docs) if value.docs is not None else None,
                    )
                )

            default_visitor = None
            if self._enum_type == "forward_compatible_python_enums":
                enum_class.add_class_var(
                    AST.VariableDeclaration(
                        name=EnumGenerator.UNKNOWN_MEMBER_NAME,
                        initializer=AST.Expression(f'"__{self._class_name.upper()}_UNKNOWN__"'),
                        docstring=AST.Docstring(
                            "This member is used for forward compatibility. "
                            "If the value is not recognized by the enum, it will be stored here, and the raw value is accessible through `.value`."
                        ),
                    )
                )

                def _write_missing_override(writer: AST.NodeWriter) -> None:
                    writer.write_line(f"unknown = cls.{EnumGenerator.UNKNOWN_MEMBER_NAME}")
                    writer.write_line("unknown._value_ = value")
                    writer.write_line("return unknown")

                # Override the enum's _missing_ method to return the _UNKNOWN member
                enum_class.add_method(
                    decorator=AST.ClassMethodDecorator.CLASS_METHOD,
                    declaration=AST.FunctionDeclaration(
                        name="_missing_",
                        signature=AST.FunctionSignature(
                            parameters=[
                                AST.FunctionParameter(name="value", type_hint=AST.TypeHint.any()),
                            ],
                            # The return type is the enum class itself, should fix this
                            return_type=f'"{self._class_name}"',
                        ),
                        body=AST.CodeWriter(_write_missing_override),
                    ),
                )

                # Add a method to the visitor to handle the _UNKNOWN member
                default_visitor = VisitableItem(
                    parameter_name="_unknown_member",
                    expected_value=f"{self._class_name}.{EnumGenerator.UNKNOWN_MEMBER_NAME}",
                    visitor_argument=VisitorArgument(
                        expression=AST.Expression("self._value_"),
                        type=AST.TypeHint.str_(),
                    ),
                )

            enum_class.add_method(
                get_visit_method(
                    items=[
                        VisitableItem(
                            parameter_name=self._get_visitor_parameter_name_for_enum_value(value),
                            expected_value=f"{self._class_name}.{_get_class_var_name(value.name.name)}",
                            visitor_argument=None,
                        )
                        for value in self._enum.values
                    ],
                    reference_to_current_value="self",
                    should_use_is_for_equality_check=True,
                    default_visitor=default_visitor,
                )
            )

    def _get_visitor_parameter_name_for_enum_value(self, enum_value: ir_types.EnumValue) -> str:
        return enum_value.name.name.snake_case.safe_name


class EnumSnippetGenerator(AbstractTypeSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: Union[ir_types.ExampleEnumType, ir_types.NameAndWireValue],
        use_str_enums: bool,
    ):
        super().__init__(snippet_writer=snippet_writer)
        self._use_str_enums = use_str_enums
        self.name = name
        self.example = example.value if isinstance(example, ir_types.ExampleEnumType) else example

    def generate_snippet(self) -> AST.Expression:
        class_reference = self.snippet_writer.get_class_reference_for_declared_type_name(
            name=self.name,
            as_request=False,
        )

        def write_enum(writer: AST.NodeWriter) -> None:
            if self._use_str_enums:
                escaped_value = self.example.wire_value.replace("\\", "\\\\").replace('"', '\\"')
                writer.write(f'"{escaped_value}"')
            else:
                enum_wire_value = self.example.name
                writer.write_node(AST.Expression(class_reference))
                writer.write(f".{_get_class_var_name(enum_wire_value)}")

        return AST.Expression(AST.CodeWriter(write_enum))


def _get_class_var_name(name: ir_types.Name) -> str:
    return name.screaming_snake_case.safe_name
