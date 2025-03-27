import typing
from dataclasses import dataclass
from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.generators.sdk.client_generator.endpoint_metadata_collector import (
    EndpointMetadataCollector,
)
from fern_python.generators.sdk.client_generator.endpoint_response_code_writer import (
    EndpointResponseCodeWriter,
)
from fern_python.snippet import SnippetRegistry, SnippetWriter
from src.fern_python.external_dependencies.json import Json
from src.fern_python.external_dependencies.websockets import Websockets
from src.fern_python.generators.core_utilities.core_utilities import CoreUtilities
from src.fern_python.utils import snake_case

from ..context.sdk_generator_context import SdkGeneratorContext
from .constants import DEFAULT_BODY_PARAMETER_VALUE
from .endpoint_function_generator import EndpointFunctionGenerator
from .generated_root_client import GeneratedRootClient
from .websocket_connect_method_generator import WebsocketConnectMethodGenerator


@dataclass
class ConstructorParameter:
    constructor_parameter_name: str
    type_hint: AST.TypeHint
    private_member_name: typing.Optional[str] = None
    initializer: Optional[AST.Expression] = None


HTTPX_PRIMITIVE_DATA_TYPES = set(
    [
        ir_types.PrimitiveTypeV1.STRING,
        ir_types.PrimitiveTypeV1.INTEGER,
        ir_types.PrimitiveTypeV1.DOUBLE,
        ir_types.PrimitiveTypeV1.BOOLEAN,
    ]
)


class SocketClientGenerator:
    WEBSOCKET_MEMBER_NAME = "_websocket"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        subpackage_id: ir_types.SubpackageId,
        websocket: Optional[ir_types.WebSocketChannel],
        class_name: str,
        async_class_name: str,
        generated_root_client: GeneratedRootClient,
    ):
        self._context = context
        self._subpackage_id = subpackage_id
        self._class_name = class_name
        self._async_class_name = async_class_name
        self._generated_root_client = generated_root_client
        self._websocket = websocket

    def generate(self, source_file: SourceFile) -> None:
        async_class_declaration = self._create_class_declaration(is_async=True)
        sync_class_declaration = self._create_class_declaration(is_async=False)
        response_type_declaration = self._create_response_type_declaration()
        source_file.add_declaration(
            declaration=response_type_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=async_class_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=sync_class_declaration,
            should_export=False,
        )

    def _get_response_type_name(self) -> str:
        return f"{self._context.get_socket_class_name_for_subpackage_service(self._subpackage_id)}Response"

    def _create_response_type_declaration(self) -> AST.TypeAliasDeclaration:
        receive_message_types = [
            msg.body.get_as_union().body_type
            for msg in self._websocket.messages
            if msg.origin == ir_types.WebSocketMessageOrigin.SERVER and msg.body.get_as_union().type == "reference"
        ]
        return AST.TypeAliasDeclaration(
            name=self._get_response_type_name(),
            type_hint=AST.TypeHint.union(
                *[
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(t)
                    for t in receive_message_types
                ]
            ),
        )

    def _create_class_declaration(self, is_async: bool) -> AST.ClassDeclaration:
        constructor_parameters = self._get_constructor_parameters(is_async=is_async)

        named_parameters = [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=param.initializer,
            )
            for param in constructor_parameters
        ]

        class_declaration = AST.ClassDeclaration(
            name=self._class_name if not is_async else self._async_class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(self._get_write_constructor_body()),
            ),
        )
        class_declaration.add_method(self._get_iterator_method(is_async=is_async))
        class_declaration.add_method(self._get_send_method(is_async=is_async))
        class_declaration.add_method(self._get_recv_method(is_async=is_async))
        for msg in self._websocket.messages:
            if msg.origin == ir_types.WebSocketMessageOrigin.CLIENT and msg.body.get_as_union().type == "reference":
                class_declaration.add_method(self._get_send_message_method(msg, is_async=is_async))
        class_declaration.add_method(self._get_send_model_method(is_async=is_async))
        return class_declaration

    def _get_constructor_parameters(self, is_async: bool) -> List[ConstructorParameter]:
        if is_async:
            return [
                ConstructorParameter(
                    constructor_parameter_name=WebsocketConnectMethodGenerator.SOCKET_CONSTRUCTOR_PARAMETER_NAME,
                    private_member_name=self.WEBSOCKET_MEMBER_NAME,
                    type_hint=AST.TypeHint(Websockets.get_async_websocket_client_protocol()),
                )
            ]
        else:
            return [
                ConstructorParameter(
                    constructor_parameter_name=WebsocketConnectMethodGenerator.SOCKET_CONSTRUCTOR_PARAMETER_NAME,
                    private_member_name=self.WEBSOCKET_MEMBER_NAME,
                    type_hint=AST.TypeHint(Websockets.get_sync_websocket_client_protocol()),
                )
            ]

    def _get_write_constructor_body(self) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            constructor_parameters = self._get_constructor_parameters(is_async=True)
            for param in constructor_parameters:
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")

        return _write_constructor_body

    def _get_iterator_method(self, is_async: bool) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="__aiter__" if is_async else "__iter__",
            is_async=is_async,
            signature=AST.FunctionSignature(),
            body=AST.CodeWriter(self._get_iterator_method_body(is_async=is_async)),
        )

    def _get_iterator_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_iterator_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"{'async ' if is_async else ''}for message in self.{self.WEBSOCKET_MEMBER_NAME}:")
            with writer.indent():
                writer.write("yield ")
                writer.write_reference(self._context.core_utilities.get_parse_obj_as())
                writer.write(f"({self._get_response_type_name()}, message)  # type: ignore")

        return _get_iterator_method_body

    def _get_send_method(self, is_async: bool) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="_send",
            is_async=is_async,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name="data",
                        type_hint=AST.TypeHint.any(),
                    ),
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(self._get_send_method_body(is_async=is_async)),
        )

    def _get_send_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_send_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line("if isinstance(data, dict):")
            with writer.indent():
                writer.write("data = ")
                writer.write_node(Json.dumps(AST.Expression("data")))
                writer.write_line()
            writer.write_line(f"{'await ' if is_async else ''}self.{self.WEBSOCKET_MEMBER_NAME}.send(data)")

        return _get_send_method_body

    def _get_recv_method(self, is_async: bool) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="recv",
            is_async=is_async,
            signature=AST.FunctionSignature(
                return_type=self._get_response_type_name(),
            ),
            body=AST.CodeWriter(self._get_recv_method_body(is_async=is_async)),
        )

    def _get_recv_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_recv_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"data = {'await ' if is_async else ''}self.{self.WEBSOCKET_MEMBER_NAME}.recv()")
            writer.write("return ")
            writer.write_reference(self._context.core_utilities.get_parse_obj_as())
            writer.write(f"({self._get_response_type_name()}, data)  # type: ignore")

        return _get_recv_method_body

    def _get_send_message_method(self, message: ir_types.WebSocketMessage, is_async: bool) -> AST.FunctionDeclaration:
        message_type = message.body.get_as_union().body_type
        message_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(message_type)
        return AST.FunctionDeclaration(
            name=f"send_{snake_case(message.type)}",
            is_async=is_async,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name="message",
                        type_hint=message_type_hint,
                    ),
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(self._get_send_message_method_body(is_async=is_async)),
        )

    def _get_send_message_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_send_message_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"{'await ' if is_async else ''}self._send_model(message)")

        return _get_send_message_method_body

    def _get_send_model_method(self, is_async: bool) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="_send_model",
            is_async=is_async,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name="data",
                        type_hint=AST.TypeHint.any(),
                    ),
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(self._get_send_model_method_body(is_async=is_async)),
        )

    def _get_send_model_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_send_model_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"{'await ' if is_async else ''}self._send(data.dict())")

        return _get_send_model_method_body
