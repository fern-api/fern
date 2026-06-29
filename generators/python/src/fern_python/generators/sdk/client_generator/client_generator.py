from typing import List, Optional

from .base_client_generator import BaseClientGeneratorKwargs, ConstructorParameter
from .base_wrapped_client_generator import BaseWrappedClientGenerator
from .endpoint_function_generator import get_endpoint_name
from .graphql_pagination import GraphqlConnectionInfo, detect_connection
from .websocket_connect_method_generator import WebsocketConnectMethodGenerator
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.generators.sdk.client_generator.generated_root_client import GeneratedRootClient
from fern_python.utils.name_resolver import get_name_from_wire_value, resolve_name
from typing_extensions import Unpack

import fern.ir.resources as ir_types


class ClientGenerator(BaseWrappedClientGenerator[ConstructorParameter]):
    def __init__(
        self,
        subpackage_id: ir_types.SubpackageId,
        generated_root_client: GeneratedRootClient,
        **kwargs: Unpack[BaseClientGeneratorKwargs],
    ):
        super().__init__(
            **kwargs,
        )
        self._subpackage_id = subpackage_id
        self._generated_root_client = generated_root_client

    def generate(self, source_file: SourceFile) -> None:
        class_declaration = self._create_class_declaration(is_async=False)
        async_class_declaration = self._create_class_declaration(is_async=True)

        if self._is_default_body_parameter_used:
            source_file.add_arbitrary_code(AST.CodeWriter(self._write_default_param))

        source_file.add_class_declaration(
            declaration=class_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=async_class_declaration,
            should_export=False,
        )

        connections = self._get_graphql_connections()
        if len(connections) > 0:
            source_file.add_class_declaration(
                declaration=self._build_paginate_class(is_async=False, connections=connections),
                should_export=False,
            )
            source_file.add_class_declaration(
                declaration=self._build_paginate_class(is_async=True, connections=connections),
                should_export=False,
            )

    def _get_graphql_connections(self) -> List[GraphqlConnectionInfo]:
        if self._package.service is None:
            return []
        service = self._context.ir.services[self._package.service]
        connections: List[GraphqlConnectionInfo] = []
        for endpoint in service.endpoints:
            info = detect_connection(self._context, endpoint, get_endpoint_name(endpoint))
            if info is not None:
                connections.append(info)
        return connections

    def _paginate_class_name(self, *, is_async: bool) -> str:
        return f"{self._async_class_name if is_async else self._class_name}Paginate"

    def _create_paginate_property(self, *, is_async: bool) -> AST.FunctionDeclaration:
        paginate_class_name = self._paginate_class_name(is_async=is_async)

        def write_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"return {paginate_class_name}(self)")

        return AST.FunctionDeclaration(
            name="paginate",
            is_async=False,
            signature=AST.FunctionSignature(
                parameters=[],
                return_type=AST.TypeHint(
                    type=AST.ClassReference(qualified_name_excluding_import=(paginate_class_name,), import_=None)
                ),
            ),
            body=AST.CodeWriter(write_body),
            decorators=[AST.Expression(AST.Reference(qualified_name_excluding_import=("property",), import_=None))],
        )

    def _build_paginate_class(
        self, *, is_async: bool, connections: List[GraphqlConnectionInfo]
    ) -> AST.ClassDeclaration:
        class_name = self._paginate_class_name(is_async=is_async)

        def write_constructor(writer: AST.NodeWriter) -> None:
            writer.write_line("self._client = client")

        class_declaration = AST.ClassDeclaration(
            name=class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    parameters=[AST.FunctionParameter(name="client", type_hint=AST.TypeHint.any())]
                ),
                body=AST.CodeWriter(write_constructor),
            ),
            docstring=AST.Docstring("Auto-paginators for this client's Relay connection fields."),
        )
        for connection in connections:
            class_declaration.add_method(self._build_paginate_method(is_async=is_async, connection=connection))
        return class_declaration

    def _build_paginate_method(
        self, *, is_async: bool, connection: GraphqlConnectionInfo
    ) -> AST.FunctionDeclaration:
        node_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(connection.node_type)
        pager_type = AST.TypeHint(
            type=self._context.core_utilities.get_paginator_reference(is_async),
            # SyncPager/AsyncPager are Generic[T, R] (node type, page-response type).
            type_parameters=[AST.TypeParameter(node_type_hint), AST.TypeParameter(AST.TypeHint.any())],
        )
        forward_params: List[AST.NamedFunctionParameter] = []
        forward_names: List[str] = []
        for prop in connection.forward_properties:
            name = resolve_name(get_name_from_wire_value(prop.name)).snake_case.safe_name
            forward_names.append(name)
            forward_params.append(
                AST.NamedFunctionParameter(
                    name=name,
                    type_hint=AST.TypeHint.optional(
                        self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            prop.value_type, in_endpoint=True
                        )
                    ),
                    initializer=AST.Expression("None"),
                )
            )
        request_options_param = AST.NamedFunctionParameter(
            name="request_options",
            type_hint=AST.TypeHint.optional(
                AST.TypeHint(self._context.core_utilities.get_reference_to_request_options())
            ),
            initializer=AST.Expression("None"),
        )

        def write_body(writer: AST.NodeWriter) -> None:
            forward_call = "".join(f"{name}={name}, " for name in forward_names)
            page_fn = "_get_page"
            writer.write_line(f"{'async def' if is_async else 'def'} {page_fn}(after: typing.Optional[str]) -> typing.Any:")
            with writer.indent():
                await_kw = "await " if is_async else ""
                writer.write_line(
                    f"_connection = {await_kw}self._client.{connection.method_name}("
                    f"{forward_call}after=after, request_options=request_options)"
                )
                if connection.edges_field is not None and connection.node_field is not None:
                    writer.write_line(
                        f"_edges = (_connection.{connection.edges_field} if _connection is not None else None) or []"
                    )
                    writer.write_line(
                        f"_items = [_edge.{connection.node_field} for _edge in _edges "
                        f"if _edge is not None and _edge.{connection.node_field} is not None]"
                    )
                else:
                    writer.write_line(
                        f"_items = (_connection.{connection.nodes_field} if _connection is not None else None) or []"
                    )
                writer.write_line(
                    f"_page_info = _connection.{connection.page_info_field} if _connection is not None else None"
                )
                writer.write_line(
                    f"_has_next = bool(_page_info.{connection.has_next_field}) if _page_info is not None else False"
                )
                writer.write_line(
                    f"_next = _page_info.{connection.end_cursor_field} if _page_info is not None else None"
                )
                pager_ref = "AsyncPager" if is_async else "SyncPager"
                if is_async:
                    writer.write_line("async def _get_next() -> typing.Any:")
                    with writer.indent():
                        writer.write_line("return await _get_page(_next)")
                    writer.write_line(
                        f"return {pager_ref}(response=_connection, items=_items, has_next=_has_next, "
                        "get_next=_get_next if (_has_next and _next is not None) else None)"
                    )
                else:
                    writer.write_line(
                        f"return {pager_ref}(response=_connection, items=_items, has_next=_has_next, "
                        "get_next=(lambda: _get_page(_next)) if (_has_next and _next is not None) else None)"
                    )
            writer.write_line(f"return {'await ' if is_async else ''}_get_page(None)")

        return AST.FunctionDeclaration(
            name=connection.method_name,
            is_async=is_async,
            signature=AST.FunctionSignature(
                parameters=[],
                named_parameters=forward_params + [request_options_param],
                return_type=pager_type,
            ),
            body=AST.CodeWriter(write_body),
        )

    def _create_class_declaration(self, *, is_async: bool) -> AST.ClassDeclaration:
        # Use the base implementation to create the class declaration
        class_declaration = self._create_class_declaration_base(is_async=is_async)

        # Add with_raw_response property (method with @property decorator)
        class_declaration.add_method(self._create_with_raw_response_method(is_async=is_async))

        if self._package.service is not None:
            service = self._context.ir.services[self._package.service]
            self._add_wrapped_client_methods(
                is_async=is_async,
                service=service,
                class_declaration=class_declaration,
                generated_root_client=self._generated_root_client,
            )

        if self._websocket is not None and self._context.custom_config.should_generate_websocket_clients:
            websocket_connect_method_generator = WebsocketConnectMethodGenerator(
                context=self._context,
                package=self._package,
                subpackage_id=self._subpackage_id,
                websocket=self._websocket,
                client_wrapper_member_name=f"{self._get_raw_client_member_name()}.{self._get_client_wrapper_member_name()}",
                is_async=is_async,
            )
            generated_connect_method = websocket_connect_method_generator.generate()
            class_declaration.add_method(generated_connect_method.function)

        if len(self._get_graphql_connections()) > 0:
            class_declaration.add_method(self._create_paginate_property(is_async=is_async))

        self._generate_lazy_import_properties(class_declaration=class_declaration, is_async=is_async)

        return class_declaration

    def get_raw_client_class_name(self, *, is_async: bool) -> str:
        return (
            self._context.get_async_raw_client_class_name_for_subpackage_service(self._subpackage_id)
            if is_async
            else self._context.get_raw_client_class_name_for_subpackage_service(self._subpackage_id)
        )

    def get_raw_client_class_reference(self, *, is_async: bool) -> AST.ClassReference:
        return (
            self._context.get_async_raw_client_class_reference_for_subpackage_service(self._subpackage_id)
            if is_async
            else self._context.get_raw_client_class_reference_for_subpackage_service(self._subpackage_id)
        )

    def _get_constructor_parameters(self, *, is_async: bool) -> List[ConstructorParameter]:
        return [
            ConstructorParameter(
                constructor_parameter_name="client_wrapper",
                # Don't store as instance variable since we access through raw_client
                private_member_name=None,
                type_hint=AST.TypeHint(self._context.core_utilities.get_reference_to_client_wrapper(is_async=is_async)),
            )
        ]

    def _get_write_constructor_body(self, *, is_async: bool) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            # Avoid repeating parameters by tracking names
            seen_param_names = set()
            kwargs = []
            for param in self._get_constructor_parameters(is_async=is_async):
                if param.constructor_parameter_name not in seen_param_names:
                    kwargs.append((param.constructor_parameter_name, AST.Expression(param.constructor_parameter_name)))
                    seen_param_names.add(param.constructor_parameter_name)

            # Initialize the raw client with the client_wrapper
            writer.write_node(
                AST.VariableDeclaration(
                    name=f"self.{self._get_raw_client_member_name()}",
                    initializer=AST.Expression(
                        AST.ClassInstantiation(
                            class_=(
                                self._context.get_async_raw_client_class_reference_for_subpackage_service(
                                    self._subpackage_id
                                )
                                if is_async
                                else self._context.get_raw_client_class_reference_for_subpackage_service(
                                    self._subpackage_id
                                )
                            ),
                            kwargs=kwargs,
                        )
                    ),
                )
            )

            self._initialize_nested_clients(writer=writer, is_async=is_async, declare_client_wrapper=True)

        return _write_constructor_body
