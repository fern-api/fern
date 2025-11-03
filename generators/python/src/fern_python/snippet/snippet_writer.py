from typing import Any, Dict, List, Optional

from .type_declaration_snippet_generator import TypeDeclarationSnippetGenerator
from fern_python.codegen import AST
from fern_python.generators.context.pydantic_generator_context import PydanticGeneratorContext

import fern.ir.resources as ir_types


class SnippetWriter:
    def __init__(
        self,
        context: PydanticGeneratorContext,
        type_declaration_snippet_generator: Optional[TypeDeclarationSnippetGenerator] = None,
        improved_imports: bool = False,
    ):
        self._context = context
        self._type_declaration_snippet_generator = type_declaration_snippet_generator
        self._improved_imports = improved_imports

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
        as_request: bool,
    ) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=self.get_module_path_for_declared_type_name(name=name, as_request=as_request),
                ),
                named_import=name.name.pascal_case.safe_name,
            ),
        )

    def get_module_path_for_declared_type_name(
        self,
        name: ir_types.DeclaredTypeName,
        as_request: bool,
    ) -> AST.ModulePath:
        modules = self._context.type_declaration_referencer.get_filepath(name=name, as_request=as_request).directories
        # Since this is the full file path, we want to not include the actual file name and stop at the last module
        module_path = tuple([directory.module_name for directory in modules[:-1]])

        return self._context.get_module_path_in_project(
            module_path,
        )

    def get_snippet_for_example_type_reference(
        self,
        example_type_reference: ir_types.ExampleTypeReference,
        use_typeddict_request: bool,
        as_request: bool,
        in_typeddict: bool = False,
        force_include_literals: bool = False,
    ) -> Optional[AST.Expression]:
        unwrapped_reference = self._context.unwrap_example_type_reference(example_type_reference)

        return unwrapped_reference.shape.visit(
            primitive=lambda primitive: self._get_snippet_for_primitive(
                primitive=primitive,
            ),
            container=lambda container: self._get_snippet_for_container(
                container=container,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
                in_typeddict=in_typeddict,
                force_include_literals=force_include_literals,
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
        request_parameter_names: Dict[ir_types.Name, str],
        in_typeddict: bool,
        use_typeddict_request: bool,
        as_request: bool,
    ) -> List[AST.Expression]:
        args: List[AST.Expression] = []
        for property in example.properties:
            value = property.value.shape.visit(
                primitive=lambda primitive: self._get_snippet_for_primitive(
                    primitive=primitive,
                ),
                container=lambda container: self._get_snippet_for_container(
                    container=container,
                    use_typeddict_request=use_typeddict_request,
                    as_request=as_request,
                    in_typeddict=in_typeddict,
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
                # TODO: we really need to centralize a lot of this logic,
                # especially around renaming and models in general
                maybe_rewritten_name = (
                    request_parameter_names.get(property.name.name) or property.name.name.snake_case.safe_name
                )
                if maybe_rewritten_name.startswith("_"):
                    maybe_rewritten_name = "f_" + maybe_rewritten_name.lstrip("_")

                args.append(
                    self.get_snippet_for_named_parameter(
                        parameter_name=maybe_rewritten_name,
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
            long_=lambda long: AST.Expression(str(long)),
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
                    args=[AST.Expression(f'"{str(datetime.datetime)}"')],
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
            uuid_=lambda uuid: AST.Expression(
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
            uint=lambda uint: AST.Expression(str(uint)),
            uint_64=lambda uint_64: AST.Expression(str(uint_64)),
            float_=lambda float_: AST.Expression(str(float_)),
            base_64=lambda base_64: AST.Expression(repr(base_64)),
            big_integer=lambda big_integer: AST.Expression(str(big_integer)),
        )

    def _get_snippet_for_string_primitive(
        self,
        escaped_string: ir_types.EscapedString,
    ) -> AST.Expression:
        string = escaped_string.original
        return AST.Expression(repr(string))

    def _get_snippet_for_container(
        self,
        container: ir_types.ExampleContainer,
        in_typeddict: bool,
        use_typeddict_request: bool,
        as_request: bool,
        force_include_literals: bool = False,
    ) -> Optional[AST.Expression]:
        return container.visit(
            list_=lambda list: self._get_snippet_for_list_or_set(
                example_type_references=list.list_,
                is_list=True,
                in_typeddict=in_typeddict,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
            ),
            set_=lambda set: self._get_snippet_for_list_or_set(
                example_type_references=set.set_,
                is_list=False,
                in_typeddict=in_typeddict,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
            ),
            optional=lambda optional: self.get_snippet_for_example_type_reference(
                example_type_reference=optional.optional,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
                in_typeddict=in_typeddict,
            )
            if optional.optional is not None
            else None,
            nullable=lambda nullable: self.get_snippet_for_example_type_reference(
                example_type_reference=nullable.nullable,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
                in_typeddict=in_typeddict,
            )
            if nullable.nullable is not None
            else None,
            map_=lambda map: self._get_snippet_for_map(
                pairs=map.map_,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
                in_typeddict=in_typeddict,
            ),
            literal=lambda lit: self._get_snippet_for_primitive(lit.literal)
            if in_typeddict or force_include_literals
            else None,
        )

    def _get_snippet_for_unknown(
        self,
        unknown: Any,
    ) -> AST.Expression:
        if unknown is None:
            return AST.Expression("None")

        if isinstance(unknown, dict):
            keys = list(unknown.keys())
            if keys and all(isinstance(k, (int, str)) for k in keys):
                try:
                    int_keys: List[int] = []
                    array_like = True
                    for k in keys:
                        if isinstance(k, int):
                            int_keys.append(k)
                        elif isinstance(k, str) and k.isdigit():
                            int_keys.append(int(k))
                        else:
                            array_like = False
                            break

                    if array_like:
                        sorted_keys = sorted(int_keys)
                        if sorted_keys == list(range(len(sorted_keys))):
                            values = []
                            for i in sorted_keys:
                                original_key = i if i in unknown else str(i)
                                value_expr = self._get_snippet_for_unknown(unknown[original_key])
                                values.append(value_expr)
                            return self._write_list(values=values)
                except (ValueError, TypeError):
                    pass

            keys_exprs = []
            values_exprs = []
            for k, v in unknown.items():
                if isinstance(k, str):
                    keys_exprs.append(AST.Expression(repr(k)))
                else:
                    keys_exprs.append(AST.Expression(str(k)))
                values_exprs.append(self._get_snippet_for_unknown(v))
            return self._write_map(keys=keys_exprs, values=values_exprs)

        if isinstance(unknown, (list, tuple)):
            values = [self._get_snippet_for_unknown(item) for item in unknown]
            return self._write_list(values=values)

        def write_unknown(writer: AST.NodeWriter) -> None:
            maybe_stringify_unknown = repr(unknown) if type(unknown) is str else unknown
            writer.write_line(f"{maybe_stringify_unknown}")

        return AST.Expression(AST.CodeWriter(write_unknown))

    def _get_snippet_for_list_or_set(
        self,
        example_type_references: List[ir_types.ExampleTypeReference],
        is_list: bool,
        in_typeddict: bool,
        use_typeddict_request: bool,
        as_request: bool,
    ) -> Optional[AST.Expression]:
        values: List[AST.Expression] = []
        # We use lists for sets if the inner type is non-primitive because Pydantic models aren't hashable
        contents_are_primitive = False
        for example_type_reference in example_type_references:
            contents_are_primitive = example_type_reference.shape.visit(
                primitive=lambda _: True,
                container=lambda _: False,
                unknown=lambda _: False,
                named=lambda _: False,
            )
            expression = self.get_snippet_for_example_type_reference(
                example_type_reference=example_type_reference,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
                in_typeddict=in_typeddict,
            )
            if expression is not None:
                values.append(expression)
        return (
            self._write_list(values=values) if is_list or not contents_are_primitive else self._write_set(values=values)
        )

    def _get_snippet_for_map(
        self,
        pairs: List[ir_types.ExampleKeyValuePair],
        in_typeddict: bool,
        use_typeddict_request: bool,
        as_request: bool,
    ) -> AST.Expression:
        keys: List[AST.Expression] = []
        values: List[AST.Expression] = []
        for pair in pairs:
            key = self.get_snippet_for_example_type_reference(
                example_type_reference=pair.key,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
                in_typeddict=in_typeddict,
            )
            value = self.get_snippet_for_example_type_reference(
                example_type_reference=pair.value,
                use_typeddict_request=use_typeddict_request,
                as_request=as_request,
                in_typeddict=in_typeddict,
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

    def _write_set(
        self,
        values: List[AST.Expression],
    ) -> AST.Expression:
        def write_list(writer: AST.NodeWriter) -> None:
            writer.write("{")
            for i, value in enumerate(values):
                if i > 0:
                    writer.write(", ")
                writer.write_node(value)
            writer.write("}")

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
