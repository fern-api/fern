import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import fern.generator_exec.resources as generator_exec
import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.source_file_factory import SourceFileFactory

from ..context import PydanticGeneratorContext


@dataclass
class EndpointExpression:
    endpoint_id: generator_exec.EndpointIdentifier
    expr: AST.Expression


@dataclass
class UnionType:
    discriminant: ir_types.NameAndWireValue
    single_union_type: ir_types.SingleUnionType


class SnippetRegistry:
    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
    ):
        self._snippets: Dict[ir_types.TypeId, AST.Expression] = {}
        self._endpoint_snippets: Dict[ir_types.EndpointId, AST.Expression] = {}
        self._sync_client_endpoint_snippets: Dict[ir_types.EndpointId, EndpointExpression] = {}
        self._async_client_endpoint_snippets: Dict[ir_types.EndpointId, EndpointExpression] = {}

        self._init_snippets_from_ir(ir, context)

    def get_snippet(self, type_id: ir_types.TypeId) -> Optional[AST.Expression]:
        if type_id in self._snippets:
            return self._snippets[type_id]
        return None

    def get_snippet_str(self, type_id: ir_types.TypeId) -> Optional[str]:
        expr = self.get_snippet(type_id)
        if expr is None:
            return None
        return self._expression_to_snippet_str(expr)

    def get_snippet_for_endpoint(self, endpoint_id: ir_types.EndpointId) -> Optional[AST.Expression]:
        if endpoint_id in self._endpoint_snippets:
            return self._endpoint_snippets[endpoint_id]
        return None

    def register_async_client_endpoint_snippet(
        self,
        endpoint: ir_types.HttpEndpoint,
        expr: AST.Expression,
    ) -> None:
        self._async_client_endpoint_snippets[endpoint.id] = EndpointExpression(
            endpoint_id=self._endpoint_to_identifier(endpoint),
            expr=expr,
        )

    def register_sync_client_endpoint_snippet(
        self,
        endpoint: ir_types.HttpEndpoint,
        expr: AST.Expression,
    ) -> None:
        self._sync_client_endpoint_snippets[endpoint.id] = EndpointExpression(
            endpoint_id=self._endpoint_to_identifier(endpoint),
            expr=expr,
        )

    def snippets(self) -> Optional[generator_exec.Snippets]:
        if (
            len(self._snippets) == 0
            and len(self._sync_client_endpoint_snippets) == 0
            and len(self._async_client_endpoint_snippets) == 0
        ):
            return None

        types: Dict[generator_exec.TypeId, str] = {}
        for typeId, expr in self._snippets.items():
            types[generator_exec.TypeId(typeId.get_as_str())] = self._expression_to_snippet_str(expr)

        endpoints: List[generator_exec.Endpoint] = []
        for endpointId, sync_endpoint_expression in self._sync_client_endpoint_snippets.items():
            endpoints.append(
                generator_exec.Endpoint(
                    id=sync_endpoint_expression.endpoint_id,
                    snippet=generator_exec.EndpointSnippet.factory.python(
                        value=generator_exec.PythonEndpointSnippet(
                            sync_client=self._expression_to_snippet_str(sync_endpoint_expression.expr),
                            async_client=self._expression_to_snippet_str(
                                self._async_client_endpoint_snippets[endpointId].expr
                            )
                            if endpointId in self._async_client_endpoint_snippets
                            else "",
                        )
                    ),
                )
            )

        return generator_exec.Snippets(
            types=types,
            endpoints=endpoints,
        )

    def _endpoint_to_identifier(
        self,
        endpoint: ir_types.HttpEndpoint,
    ) -> generator_exec.EndpointIdentifier:
        return generator_exec.EndpointIdentifier(
            path=generator_exec.EndpointPath(self._full_path_for_endpoint(endpoint)),
            method=self._ir_method_to_generator_exec_method(endpoint.method),
        )

    def _full_path_for_endpoint(
        self,
        endpoint: ir_types.HttpEndpoint,
    ) -> str:
        components: List[str] = []
        head = endpoint.full_path.head.strip("/")
        if len(head) > 0:
            components.append(head)
        for part in endpoint.full_path.parts:
            components.append("{" + part.path_parameter + "}")
            tail = part.tail.strip("/")
            if len(tail) > 0:
                components.append(tail)
        return "/" + "/".join(components)

    def _ir_method_to_generator_exec_method(
        self,
        method: ir_types.HttpMethod,
    ) -> generator_exec.EndpointMethod:
        if method is ir_types.HttpMethod.GET:
            return generator_exec.EndpointMethod.GET
        if method is ir_types.HttpMethod.POST:
            return generator_exec.EndpointMethod.POST
        if method is ir_types.HttpMethod.PUT:
            return generator_exec.EndpointMethod.PUT
        if method is ir_types.HttpMethod.PATCH:
            return generator_exec.EndpointMethod.PATCH
        if method is ir_types.HttpMethod.DELETE:
            return generator_exec.EndpointMethod.DELETE

    def _expression_to_snippet_str(
        self,
        expr: AST.Expression,
    ) -> str:
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
        for serviceId, service in ir.services.items():
            for endpoint in service.endpoints:
                self._snippet_for_endpoint(
                    ir=ir,
                    context=context,
                    serviceId=serviceId,
                    service=service,
                    endpoint=endpoint,
                )

    def _snippet_for_endpoint(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        serviceId: ir_types.ServiceId,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
    ) -> Optional[AST.Expression]:
        if len(endpoint.examples) == 0:
            # For now, we only include snippets for endpoints that specify examples.
            return None

        # For now, the snippet we generate is always just the first example.
        # This is the example that we register for external use.
        example_endpoint_call = endpoint.examples[0]
        return self._snippet_for_example_endpoint_call(
            ir=ir,
            context=context,
            serviceId=serviceId,
            service=service,
            endpoint=endpoint,
            example_endpoint_call=example_endpoint_call,
            register=True,
        )

    def _snippet_for_example_endpoint_call(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        serviceId: ir_types.ServiceId,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        example_endpoint_call: ir_types.ExampleEndpointCall,
        register: bool = False,
    ) -> AST.Expression:
        args: List[AST.Expression] = []
        all_path_parameters = (
            example_endpoint_call.root_path_parameters
            + example_endpoint_call.service_path_parameters
            + example_endpoint_call.endpoint_path_parameters
        )
        for property in all_path_parameters:
            path_parameter_name = self._get_path_parameter_name_from_key(
                endpoint=endpoint,
                key=property.key,
            )
            path_parameter_value = self._snippet_for_example_type_reference(
                ir=ir,
                context=context,
                example_type_reference=property.value,
            )
            args.append(
                self._write_named_parameter_for_value(
                    parameter_name=path_parameter_name,
                    value=path_parameter_value,
                ),
            )

        all_headers = example_endpoint_call.service_headers + example_endpoint_call.endpoint_headers
        for header in all_headers:
            header_parameter_name = self._get_header_name_from_wire_key(
                service=service,
                endpoint=endpoint,
                wire_key=header.wire_key,
            )
            header_parameter_value = self._snippet_for_example_type_reference(
                ir=ir,
                context=context,
                example_type_reference=header.value,
            )
            args.append(
                self._write_named_parameter_for_value(
                    parameter_name=header_parameter_name,
                    value=header_parameter_value,
                ),
            )

        for query_parameter in example_endpoint_call.query_parameters:
            query_parameter_name = self._get_query_parameter_name_from_wire_key(
                endpoint=endpoint,
                wire_key=query_parameter.wire_key,
            )
            query_parameter_value = self._snippet_for_example_type_reference(
                ir=ir,
                context=context,
                example_type_reference=query_parameter.value,
            )
            args.append(
                self._write_named_parameter_for_value(
                    parameter_name=query_parameter_name,
                    value=query_parameter_value,
                ),
            )

        if example_endpoint_call.request is not None:
            args.extend(
                example_endpoint_call.request.visit(
                    inlined_request_body=lambda inlined_request_body: self._snippet_for_inlined_request_body_properties(
                        ir=ir,
                        context=context,
                        endpoint=endpoint,
                        example_inlined_request_body=inlined_request_body,
                    ),
                    reference=lambda reference: self._snippet_for_request_reference(
                        ir=ir,
                        context=context,
                        endpoint=endpoint,
                        example_type_reference=reference,
                    ),
                ),
            )

        snippet = AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(endpoint.name.get_as_name().snake_case.safe_name,),
                ),
                args=args,
            ),
        )
        if register:
            self._endpoint_snippets[endpoint.id] = snippet
        return snippet

    def _snippet_for_inlined_request_body_properties(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        endpoint: ir_types.HttpEndpoint,
        example_inlined_request_body: ir_types.ExampleInlinedRequestBody,
    ) -> List[AST.Expression]:
        wire_key_to_property = self._get_inlined_request_properties_for_endpoint(
            context=context,
            endpoint=endpoint,
        )
        snippets: List[AST.Expression] = []
        for example_property in example_inlined_request_body.properties:
            property = wire_key_to_property[example_property.wire_key]
            if property is None:
                raise Exception(
                    f"internal error: cannot generate snippet - example wire key {example_property.wire_key} did not match a property in endpoint {endpoint.name.get_as_name().original_name}"
                )
            snippets.append(
                self._write_named_parameter_for_value(
                    parameter_name=property.name.name.snake_case.unsafe_name,
                    value=self._snippet_for_example_type_reference(
                        ir=ir,
                        context=context,
                        example_type_reference=example_property.value,
                    ),
                ),
            )
        return snippets

    def _snippet_for_request_reference(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        endpoint: ir_types.HttpEndpoint,
        example_type_reference: ir_types.ExampleTypeReference,
    ) -> List[AST.Expression]:
        return [
            self._write_named_parameter_for_value(
                parameter_name=self._get_request_parameter_name(endpoint),
                value=self._snippet_for_example_type_reference(
                    ir=ir,
                    context=context,
                    example_type_reference=example_type_reference,
                ),
            )
        ]

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
        return AST.Expression(
            AST.ClassInstantiation(
                class_=self._get_class_reference_for_declared_type_name(
                    context=context,
                    name=name,
                ),
                args=self._snippet_for_object_properties(
                    ir=ir,
                    context=context,
                    example=example,
                ),
            ),
        )

    def _snippet_for_object_properties(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        example: ir_types.ExampleObjectType,
    ) -> List[AST.Expression]:
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
            parameter_name = self._get_property_key(
                ir=ir,
                property=property,
            )
            args.append(
                self._write_named_parameter_for_value(
                    parameter_name=parameter_name,
                    value=value,
                ),
            )
        return args

    def _snippet_for_primitive(
        self,
        primitive: ir_types.ExamplePrimitive,
    ) -> AST.Expression:
        return primitive.visit(
            integer=lambda integer: AST.Expression(str(integer)),
            double=lambda double: AST.Expression(str(double)),
            string=lambda string: self._snippet_for_string_primitive(string),
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

    def _snippet_for_string_primitive(
        self,
        string: str,
    ) -> AST.Expression:
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
        union_type = type_decl.shape.visit(
            alias=lambda _: None,
            enum=lambda _: None,
            object=lambda _: None,
            union=lambda union: self._get_union_type_for_example(
                union=union,
                example=example,
            ),
            undiscriminated_union=lambda _: None,
        )

        if union_type is None:
            raise Exception(f"internal error: cannot generate snippet - expected an example union for {name.type_id}")

        snippet = example.properties.visit(
            same_properties_as_object=lambda named: self._snippet_for_union_with_same_properties_as_object(
                ir=ir,
                context=context,
                name=name,
                union_type=union_type,
                example=named,
            )
            if union_type is not None
            else None,
            single_property=lambda example_type_reference: self._snippet_for_union_with_single_property(
                ir=ir,
                context=context,
                name=name,
                union_type=union_type,
                example=example_type_reference,
            )
            if union_type is not None
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
        union_type: UnionType,
        example: ir_types.ExampleNamedType,
    ) -> AST.Expression:
        object = example.shape.visit(
            alias=lambda _: None,
            enum=lambda _: None,
            object=lambda object: object,
            union=lambda _: None,
        )
        if object is None:
            raise Exception(f"internal error: cannot generate snippet - expected an example object for {name.type_id}")

        args: List[AST.Expression] = []
        args.append(
            self._snippet_for_union_discriminant_parameter(
                union_type=union_type,
            ),
        )
        args.extend(
            self._snippet_for_object_properties(
                ir=ir,
                context=context,
                example=object,
            ),
        )

        union_class_reference = self._get_union_class_reference(
            context=context,
            name=name,
            single_union_type=union_type.single_union_type,
        )

        return AST.Expression(
            AST.ClassInstantiation(
                class_=union_class_reference,
                args=args,
            ),
        )

    def _snippet_for_union_with_single_property(
        self,
        ir: ir_types.IntermediateRepresentation,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
        union_type: UnionType,
        example: ir_types.ExampleTypeReference,
    ) -> AST.Expression:
        union_class_reference = self._get_union_class_reference(
            context=context,
            name=name,
            single_union_type=union_type.single_union_type,
        )
        union_discriminant_parameter = self._snippet_for_union_discriminant_parameter(
            union_type=union_type,
        )
        union_value = self._snippet_for_example_type_reference(
            ir=ir,
            context=context,
            example_type_reference=example,
        )

        def write_union(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(union_class_reference))
            writer.write("(")
            writer.write_node(union_discriminant_parameter)
            writer.write(", ")
            writer.write("value=")
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

    def _snippet_for_union_discriminant_parameter(
        self,
        union_type: UnionType,
    ) -> AST.Expression:
        return self._write_named_parameter_for_value(
            parameter_name=union_type.discriminant.name.snake_case.unsafe_name,
            value=AST.Expression(f'"{union_type.single_union_type.discriminant_value.wire_value}"'),
        )

    def _get_union_type_for_example(
        self,
        union: ir_types.UnionTypeDeclaration,
        example: ir_types.ExampleSingleUnionType,
    ) -> Optional[UnionType]:
        for single_union_type in union.types:
            if single_union_type.discriminant_value.wire_value == example.wire_discriminant_value:
                return UnionType(
                    discriminant=union.discriminant,
                    single_union_type=single_union_type,
                )
        return None

    def _get_union_class_reference(
        self,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
        single_union_type: ir_types.SingleUnionType,
    ) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=self._get_module_path_for_declared_type_name(
                        context=context,
                        name=name,
                    ),
                ),
                named_import=f"{name.name.pascal_case.unsafe_name}_{single_union_type.discriminant_value.name.pascal_case.unsafe_name}",
            ),
        )

    def _get_class_reference_for_declared_type_name(
        self,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
    ) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=self._get_module_path_for_declared_type_name(
                        context=context,
                        name=name,
                    ),
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

    def _get_path_parameter_name_from_key(
        self,
        endpoint: ir_types.HttpEndpoint,
        key: str,
    ) -> str:
        for path_parameter in endpoint.all_path_parameters:
            if path_parameter.name.original_name == key:
                return path_parameter.name.snake_case.unsafe_name
        return key

    def _get_header_name_from_wire_key(
        self,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        wire_key: str,
    ) -> str:
        all_headers = service.headers + endpoint.headers
        for header in all_headers:
            if header.name.wire_value == wire_key:
                return header.name.name.snake_case.safe_name
        return wire_key

    def _get_query_parameter_name_from_wire_key(
        self,
        endpoint: ir_types.HttpEndpoint,
        wire_key: str,
    ) -> str:
        for query_parameter in endpoint.query_parameters:
            if query_parameter.name.wire_value == wire_key:
                return query_parameter.name.name.snake_case.safe_name
        return wire_key

    def _get_inlined_request_properties_for_endpoint(
        self,
        context: PydanticGeneratorContext,
        endpoint: ir_types.HttpEndpoint,
    ) -> Dict[str, ir_types.InlinedRequestBodyProperty]:
        if endpoint.request_body is None:
            raise Exception("in-lined request body is referenced but HttpRequestBody is not defined")

        properties = endpoint.request_body.visit(
            inlined_request_body=lambda inlined_request_body: self._get_properties_for_inlined_request_body(
                context=context,
                inlined_request_body=inlined_request_body,
            ),
            reference=lambda _: None,
            file_upload=lambda _: None,
            bytes=lambda _: None,
        )
        if properties is None:
            raise Exception("in-lined request body is referenced but HttpRequestBody is not an in-lined request")

        wire_key_to_property: Dict[str, ir_types.InlinedRequestBodyProperty] = {}
        for property in properties:
            wire_key_to_property[property.name.wire_value] = property

        return wire_key_to_property

    def _get_properties_for_inlined_request_body(
        self,
        context: PydanticGeneratorContext,
        inlined_request_body: ir_types.InlinedRequestBody,
    ) -> List[ir_types.InlinedRequestBodyProperty]:
        properties = inlined_request_body.properties.copy()
        for extension in inlined_request_body.extends:
            properties.extend(
                [
                    ir_types.InlinedRequestBodyProperty(
                        name=extended_property.name,
                        value_type=extended_property.value_type,
                        docs=extended_property.docs,
                    )
                    for extended_property in (context.get_all_properties_including_extensions(extension))
                ]
            )
        return properties

    def _get_request_parameter_name(
        self,
        endpoint: ir_types.HttpEndpoint,
    ) -> str:
        if endpoint.sdk_request is None:
            raise Exception("request body is referenced but SDKRequestBody is not defined")
        return endpoint.sdk_request.request_parameter_name.snake_case.unsafe_name

    def _write_named_parameter_for_value(
        self,
        parameter_name: str,
        value: AST.Expression,
    ) -> AST.Expression:
        def write_named_parameter(writer: AST.NodeWriter) -> None:
            writer.write(f"{parameter_name}=")
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

    def _get_module_path_for_declared_type_name(
        self,
        context: PydanticGeneratorContext,
        name: ir_types.DeclaredTypeName,
    ) -> AST.ModulePath:
        module_path = tuple([directory.snake_case.unsafe_name for directory in name.fern_filepath.package_path])
        if len(module_path) > 0:
            # If the type is defined in a subpackge, it needs to be imported with the 'resources'
            # intermediary key. Otherwise the types can be imported from the root package.
            module_path = ("resources",) + module_path
        return context.get_module_path_in_project(
            module_path,
        )
