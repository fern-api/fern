import json
from typing import Any, List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.generators.context import PydanticGeneratorContext

from .type_declaration_snippet_generator import TypeDeclarationSnippetGenerator


class SnippetWriter:
    def __init__(
        self,
        context: PydanticGeneratorContext,
        type_declaration_snippet_generator: Optional[TypeDeclarationSnippetGenerator] = None,
    ):
        self._context = context
        self._type_declaration_snippet_generator = type_declaration_snippet_generator

    def get_snippet_for_example_type_shape(
        self,
        name: ir_types.DeclaredTypeName,
        example_type_shape: ir_types.ExampleTypeShape,
    ) -> Optional[AST.Expression]:
        if self._type_declaration_snippet_generator is None:
            return None

        return self._type_declaration_snippet_generator.generate_snippet(
            name=name,
            example=example_type_shape,
        )

    def get_class_reference_for_declared_type_name(
        self,
        name: ir_types.DeclaredTypeName,
    ) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=self.get_module_path_for_declared_type_name(
                        name=name,
                    ),
                ),
                named_import=name.name.pascal_case.unsafe_name,
            ),
        )

    def get_module_path_for_declared_type_name(
        self,
        name: ir_types.DeclaredTypeName,
    ) -> AST.ModulePath:
        module_path = tuple([directory.snake_case.unsafe_name for directory in name.fern_filepath.package_path])
        return self._context.get_module_path_in_project(
            module_path,
        )

    def get_snippet_for_example_type_reference(
        self,
        example_type_reference: ir_types.ExampleTypeReference,
    ) -> Optional[AST.Expression]:
        return example_type_reference.shape.visit(
            primitive=lambda primitive: self._get_snippet_for_primitive(
                primitive=primitive,
            ),
            container=lambda container: self._get_snippet_for_container(
                container=container,
            ),
            unknown=lambda unknown: self._get_snippet_for_unknown(
                unknown=unknown,
            ),
            named=lambda named: self.get_snippet_for_example_type_shape(
                name=named.type_name,
                example_type_shape=named.shape,
            ),
        )

    def get_snippet_for_object_properties(
        self,
        example: ir_types.ExampleObjectType,
    ) -> List[AST.Expression]:
        args: List[AST.Expression] = []
        for property in example.properties:
            value = property.value.shape.visit(
                primitive=lambda primitive: self._get_snippet_for_primitive(
                    primitive=primitive,
                ),
                container=lambda container: self._get_snippet_for_container(
                    container=container,
                ),
                unknown=lambda unknown: self._get_snippet_for_unknown(
                    unknown=unknown,
                ),
                named=lambda named: self.get_snippet_for_example_type_shape(
                    name=named.type_name,
                    example_type_shape=named.shape,
                ),
            )
            if value is not None:
                args.append(
                    self.get_snippet_for_named_parameter(
                        parameter_name=property.name.name.snake_case.safe_name,
                        value=value,
                    ),
                )
        return args

    def get_snippet_for_named_parameter(
        self,
        parameter_name: str,
        value: AST.Expression,
    ) -> AST.Expression:
        def write_named_parameter(writer: AST.NodeWriter) -> None:
            writer.write(f"{parameter_name}=")
            writer.write_node(value)

        return AST.Expression(AST.CodeWriter(write_named_parameter))

    def _get_snippet_for_primitive(
        self,
        primitive: ir_types.ExamplePrimitive,
    ) -> AST.Expression:
        return primitive.visit(
            integer=lambda integer: AST.Expression(str(integer)),
            double=lambda double: AST.Expression(str(double)),
            string=lambda string: self._get_snippet_for_string_primitive(string),
            boolean=lambda boolean: AST.Expression(str(boolean)),
            long=lambda long: AST.Expression(str(long)),
            datetime=lambda datetime: AST.Expression(
                AST.FunctionInvocation(
                    function_definition=AST.ClassReference(
                        import_=AST.ReferenceImport(
                            module=AST.Module.snippet(
                                module_path=("datetime",),
                            )
                        ),
                        qualified_name_excluding_import=(
                            "datetime",
                            "fromisoformat",
                        ),
                    ),
                    args=[AST.Expression(f'"{str(datetime)}"')],
                ),
            ),
            date=lambda date: AST.Expression(
                AST.FunctionInvocation(
                    function_definition=AST.ClassReference(
                        import_=AST.ReferenceImport(
                            module=AST.Module.snippet(
                                module_path=("datetime",),
                            )
                        ),
                        qualified_name_excluding_import=(
                            "date",
                            "fromisoformat",
                        ),
                    ),
                    args=[AST.Expression(f'"{str(date)}"')],
                ),
            ),
            uuid=lambda uuid: AST.Expression(
                AST.FunctionInvocation(
                    function_definition=AST.ClassReference(
                        import_=AST.ReferenceImport(
                            module=AST.Module.snippet(
                                module_path=("uuid",),
                            )
                        ),
                        qualified_name_excluding_import=("UUID",),
                    ),
                    args=[AST.Expression(f'"{str(uuid)}"')],
                ),
            ),
        )

    def _get_snippet_for_string_primitive(
        self,
        escaped_string: ir_types.EscapedString,
    ) -> AST.Expression:
        string = escaped_string.original
        if '"' in string:
            # There are literal quotes in the given string.
            # We want to preserve the format and instead surround
            # the string in single quotes.
            #
            # This is especially relevant for JSON examples
            # specified as a string (e.g. '{"foo": "bar"}').
            clean = string.replace("'", '"')
            return AST.Expression(f"'{clean}'")
        return AST.Expression(f'"{string}"')

    def _get_snippet_for_container(
        self,
        container: ir_types.ExampleContainer,
    ) -> Optional[AST.Expression]:
        return container.visit(
            list=lambda list: self._get_snippet_for_list_or_set(
                example_type_references=list,
            ),
            set=lambda set: self._get_snippet_for_list_or_set(
                example_type_references=set,
            ),
            optional=lambda optional: self.get_snippet_for_example_type_reference(
                example_type_reference=optional,
            )
            if optional is not None
            else None,
            map=lambda map: self._get_snippet_for_map(
                pairs=map,
            ),
        )

    def _get_snippet_for_unknown(
        self,
        unknown: Any,
    ) -> AST.Expression:
        return AST.Expression(json.dumps(unknown))

    def _get_snippet_for_list_or_set(
        self,
        example_type_references: List[ir_types.ExampleTypeReference],
    ) -> Optional[AST.Expression]:
        values: List[AST.Expression] = []
        for example_type_reference in example_type_references:
            expression = self.get_snippet_for_example_type_reference(
                example_type_reference=example_type_reference,
            )
            if expression is not None:
                values.append(expression)
        return self._write_list(values=values)

    def _get_snippet_for_map(
        self,
        pairs: List[ir_types.ExampleKeyValuePair],
    ) -> Optional[AST.Expression]:
        keys: List[AST.Expression] = []
        values: List[AST.Expression] = []
        for pair in pairs:
            key = self.get_snippet_for_example_type_reference(
                example_type_reference=pair.key,
            )
            value = self.get_snippet_for_example_type_reference(
                example_type_reference=pair.value,
            )
            if key is not None and value is not None:
                keys.append(key)
                values.append(value)
        return self._write_map(keys=keys, values=values)

    def _write_list(
        self,
        values: List[AST.Expression],
    ) -> AST.Expression:
        def write_list(writer: AST.NodeWriter) -> None:
            writer.write("[")
            for i, value in enumerate(values):
                if i > 0:
                    writer.write(", ")
                writer.write_node(value)
            writer.write("]")

        return AST.Expression(AST.CodeWriter(write_list))

    def _write_map(
        self,
        keys: List[AST.Expression],
        values: List[AST.Expression],
    ) -> AST.Expression:
        def write_map(writer: AST.NodeWriter) -> None:
            writer.write("{")
            for i, key in enumerate(keys):
                if i > 0:
                    writer.write(", ")
                writer.write_node(key)
                writer.write(": ")
                writer.write_node(values[i])
            writer.write("}")

        return AST.Expression(AST.CodeWriter(write_map))
