import json
from typing import Any, Dict, List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.source_file_factory import SourceFileFactory

from ..context import PydanticGeneratorContext


class SnippetRegistry:
    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
    ):
        self._snippets: Dict[ir_types.TypeId, AST.Expression] = {}
        self._init_snippets_from_ir(ir, context)

    def get_snippet(self, type_id: ir_types.TypeId) -> Optional[AST.Expression]:
        if type_id in self._snippets:
            return self._snippets[type_id]
        return None

    def get_snippet_str(self, type_id: ir_types.TypeId) -> Optional[str]:
        expr = self.get_snippet(type_id)
        if expr is None:
            return None

        snippet = SourceFileFactory.create_snippet()
        snippet.add_expression(expr)
        return snippet.to_str()

    def _init_snippets_from_ir(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
    ) -> None:
        for type in ir.types.values():
            self._snippet_for_type(
                ir=ir,
                context=context,
                type=type,
            )

    def _snippet_for_type(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        type: ir_types.TypeDeclaration,
    ) -> Optional[AST.Expression]:
        if len(type.examples) == 0:
            # For now, we only include snippets for types that specify examples.
            return None

        # For now, the snippet we generate is always just the first example.
        # This is the example that we register for external use.
        example_type = type.examples[0]
        return self._snippet_for_example_type_shape(
            ir=ir,
            context=context,
            name=type.name,
            example_type_shape=example_type.shape,
            register=True,
        )

    def _snippet_for_example_type_shape(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
        example_type_shape: ir_types.ExampleTypeShape,
        register: bool = False,
    ) -> AST.Expression:
        snippet = example_type_shape.visit(
            alias=lambda alias: self._snippet_for_alias(
                ir=ir,
                context=context,
                example=alias,
            ),
            enum=lambda enum: self._snippet_for_enum(
                ir=ir,
                context=context,
                name=name,
                example=enum,
            ),
            object=lambda object_: self._snippet_for_object(
                ir=ir,
                context=context,
                name=name,
                example=object_,
            ),
            union=lambda union: self._snippet_for_union(
                ir=ir,
                context=context,
                name=name,
                example=union,
            ),
        )
        if register:
            self._snippets[name.type_id] = snippet
        return snippet

    def _snippet_for_alias(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        example: ir_types.ExampleAliasType,
    ) -> AST.Expression:
        return self._snippet_for_example_type_reference(
            ir=ir,
            context=context,
            example_type_reference=example.value,
        )

    def _snippet_for_enum(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleEnumType,
    ) -> AST.Expression:
        type_decl = ir.types[name.type_id]
        value = type_decl.shape.visit(
            alias=lambda _: None,
            enum=lambda enum: self._get_enum_value_from_enum(
                enum=enum,
                wire_value=example.wire_value,
            ),
            object=lambda _: None,
            union=lambda _: None,
            undiscriminated_union=lambda _: None,
        )
        if value is None:
            raise Exception(f"internal error: cannot generate snippet - expected an example enum for {name.type_id}")

        class_reference = self._get_class_reference_for_declared_type_name(
            context=context,
            name=name,
        )

        def write_enum(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(class_reference))
            writer.write(f".{value}")

        return AST.Expression(AST.CodeWriter(write_enum))

    def _get_enum_value_from_enum(
        self,
        enum: ir_types.EnumTypeDeclaration,
        wire_value: str,
    ) -> str:
        for enum_value in enum.values:
            if enum_value.name.wire_value == wire_value:
                return enum_value.name.name.screaming_snake_case.unsafe_name
        return wire_value

    def _snippet_for_object(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleObjectType,
    ) -> AST.Expression:
        args: List[AST.Expression] = []
        for property in example.properties:
            value = property.value.shape.visit(
                primitive=lambda primitive: self._snippet_for_primitive(
                    primitive=primitive,
                ),
                container=lambda container: self._snippet_for_container(
                    ir=ir,
                    context=context,
                    container=container,
                ),
                unknown=lambda unknown: self._snippet_for_unknown(
                    unknown=unknown,
                ),
                named=lambda named: self._snippet_for_example_type_shape(
                    ir=ir,
                    context=context,
                    name=named.type_name,
                    example_type_shape=named.shape,
                ),
            )
            key = self._get_property_key(
                ir=ir,
                property=property,
            )
            args.append(self._write_named_parameter_for_property_key(key, value))

        return AST.Expression(
            AST.ClassInstantiation(
                class_=self._get_class_reference_for_declared_type_name(
                    context=context,
                    name=name,
                ),
                args=args,
            ),
        )

    def _snippet_for_primitive(
        self,
        primitive: ir_types.ExamplePrimitive,
    ) -> AST.Expression:
        return primitive.visit(
            integer=lambda integer: AST.Expression(str(integer)),
            double=lambda double: AST.Expression(str(double)),
            string=lambda string: AST.Expression(f'"{string}"'),
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

    def _snippet_for_container(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        container: ir_types.ExampleContainer,
    ) -> AST.Expression:
        snippet = container.visit(
            list=lambda list: self._write_list(
                values=[
                    self._snippet_for_example_type_reference(
                        ir=ir,
                        context=context,
                        example_type_reference=example_type_reference,
                    )
                    for example_type_reference in list
                ],
            ),
            set=lambda set: self._write_list(
                values=[
                    self._snippet_for_example_type_reference(
                        ir=ir,
                        context=context,
                        example_type_reference=example_type_reference,
                    )
                    for example_type_reference in set
                ],
            ),
            optional=lambda optional: self._snippet_for_example_type_reference(
                ir=ir,
                context=context,
                example_type_reference=optional,
            )
            if optional is not None
            else None,
            map=lambda map: self._write_map(
                keys=[
                    self._snippet_for_example_type_reference(
                        ir=ir,
                        context=context,
                        example_type_reference=pair.key,
                    )
                    for pair in map
                ],
                values=[
                    self._snippet_for_example_type_reference(
                        ir=ir,
                        context=context,
                        example_type_reference=pair.value,
                    )
                    for pair in map
                ],
            ),
        )
        if snippet is None:
            raise Exception("internal error: cannot generate snippet - expected an example container but found none")
        return snippet

    def _snippet_for_example_type_reference(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        example_type_reference: ir_types.ExampleTypeReference,
    ) -> AST.Expression:
        return example_type_reference.shape.visit(
            primitive=lambda primitive: self._snippet_for_primitive(
                primitive=primitive,
            ),
            container=lambda container: self._snippet_for_container(
                ir=ir,
                context=context,
                container=container,
            ),
            unknown=lambda unknown: self._snippet_for_unknown(
                unknown=unknown,
            ),
            named=lambda named: self._snippet_for_example_type_shape(
                ir=ir,
                context=context,
                name=named.type_name,
                example_type_shape=named.shape,
            ),
        )

    def _snippet_for_unknown(
        self,
        unknown: Any,
    ) -> AST.Expression:
        return AST.Expression(json.dumps(unknown))

    def _snippet_for_union(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleSingleUnionType,
    ) -> AST.Expression:
        type_decl = ir.types[name.type_id]
        single_union_type = type_decl.shape.visit(
            alias=lambda _: None,
            enum=lambda _: None,
            object=lambda _: None,
            union=lambda union: self._single_union_type_for_example(
                union=union,
                example=example,
            ),
            undiscriminated_union=lambda _: None,
        )

        if single_union_type is None:
            raise Exception(f"internal error: cannot generate snippet - expected an example union for {name.type_id}")

        snippet = example.properties.visit(
            same_properties_as_object=lambda named: self._snippet_for_union_with_same_properties_as_object(
                ir=ir,
                context=context,
                name=name,
                single_union_type=single_union_type,
                example=named,
            )
            if single_union_type is not None
            else None,
            single_property=lambda example_type_reference: self._snippet_for_union_with_single_property(
                ir=ir,
                context=context,
                name=name,
                single_union_type=single_union_type,
                example=example_type_reference,
            )
            if single_union_type is not None
            else None,
            no_properties=lambda: self._snippet_for_union_with_no_properties(
                context=context,
                name=name,
            ),
        )

        if snippet is None:
            raise Exception(f"internal error: cannot generate snippet - expected an example union for {name.type_id}")

        return snippet

    def _snippet_for_union_with_same_properties_as_object(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
        single_union_type: ir_types.SingleUnionType,
        example: ir_types.ExampleNamedType,
    ) -> AST.Expression:
        union_class_reference = AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=context.get_module_path_in_project(()),
                ),
                named_import=f"{name.name.pascal_case.unsafe_name}_{single_union_type.discriminant_value.name.pascal_case.unsafe_name}",
            ),
        )
        union_value = self._snippet_for_example_type_shape(
            ir=ir,
            context=context,
            name=example.type_name,
            example_type_shape=example.shape,
        )

        def write_union(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(union_class_reference))
            writer.write("(value=")
            writer.write_node(union_value)
            writer.write(")")

        return AST.Expression(AST.CodeWriter(write_union))

    def _snippet_for_union_with_single_property(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
        single_union_type: ir_types.SingleUnionType,
        example: ir_types.ExampleTypeReference,
    ) -> AST.Expression:
        union_class_reference = AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=context.get_module_path_in_project(()),
                ),
                named_import=f"{name.name.pascal_case.unsafe_name}_{single_union_type.discriminant_value.name.pascal_case.unsafe_name}",
            ),
        )
        union_value = self._snippet_for_example_type_reference(
            ir=ir,
            context=context,
            example_type_reference=example,
        )

        def write_union(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(union_class_reference))
            writer.write("(value=")
            writer.write_node(union_value)
            writer.write(")")

        return AST.Expression(AST.CodeWriter(write_union))

    def _snippet_for_union_with_no_properties(
        self,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
    ) -> AST.Expression:
        union_class_reference = self._get_class_reference_for_declared_type_name(
            context=context,
            name=name,
        )

        def write_union(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(union_class_reference))
            writer.write("()")

        return AST.Expression(AST.CodeWriter(write_union))

    def _single_union_type_for_example(
        self,
        union: ir_types.UnionTypeDeclaration,
        example: ir_types.ExampleSingleUnionType,
    ) -> Optional[ir_types.SingleUnionType]:
        for single_union_type in union.types:
            if single_union_type.discriminant_value.wire_value == example.wire_discriminant_value:
                return single_union_type
        return None

    def _get_class_reference_for_declared_type_name(
        self,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
    ) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=context.get_module_path_in_project(()),
                ),
                named_import=name.name.pascal_case.unsafe_name,
            ),
        )

    def _get_property_key(
        self,
        ir: ir_types.IntermediateRepresentation,
        property: ir_types.ExampleObjectProperty,
    ) -> str:
        type_decl = ir.types[property.original_type_declaration.type_id]
        snippet = type_decl.shape.visit(
            alias=lambda _: None,
            enum=lambda _: None,
            object=lambda object_: self._get_property_key_from_object(
                object_=object_,
                wire_key=property.wire_key,
            ),
            union=lambda _: None,
            undiscriminated_union=lambda _: None,
        )

        if snippet is None:
            raise Exception(
                f"internal error: cannot generate snippet - expected an example object for {property.original_type_declaration.type_id}"
            )

        return snippet

    def _get_property_key_from_object(
        self,
        object_: ir_types.ObjectTypeDeclaration,
        wire_key: str,
    ) -> str:
        for property in object_.properties:
            if property.name.wire_value == wire_key:
                return property.name.name.snake_case.safe_name
        return wire_key

    def _write_named_parameter_for_property_key(
        self,
        property_key: str,
        value: AST.Expression,
    ) -> AST.Expression:
        def write_named_parameter(writer: AST.NodeWriter) -> None:
            writer.write(f"{property_key}=")
            writer.write_node(value)

        return AST.Expression(AST.CodeWriter(write_named_parameter))

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
