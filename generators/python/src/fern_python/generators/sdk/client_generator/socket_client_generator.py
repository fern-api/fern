import typing
from dataclasses import dataclass
from typing import List, Optional

from ..context.sdk_generator_context import SdkGeneratorContext
from .generated_root_client import GeneratedRootClient
from .websocket_connect_method_generator import WebsocketConnectMethodGenerator
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.external_dependencies.json import Json
from fern_python.external_dependencies.websockets import Websockets
from fern_python.utils import snake_case

import fern.ir.resources as ir_types


@dataclass
class ConstructorParameter:
    constructor_parameter_name: str
    type_hint: AST.TypeHint
    private_member_name: typing.Optional[str] = None
    initializer: Optional[AST.Expression] = None


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
        return f"{self._context.get_socket_client_class_name_for_subpackage_service(self._subpackage_id)}Response"

    def _create_response_type_declaration(self) -> AST.TypeAliasDeclaration:
        receive_message_types = []
        if self._websocket and self._websocket.messages:
            for msg in self._websocket.messages:
                body_union = msg.body.get_as_union()
                if (
                    msg.origin == ir_types.WebSocketMessageOrigin.SERVER
                    and body_union.type == "reference"
                    and hasattr(body_union, "body_type")
                ):
                    receive_message_types.append(body_union.body_type)

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
            extends=[self._context.core_utilities.get_event_emitter_mixin()],
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(self._get_write_constructor_body()),
            ),
        )
        class_declaration.add_method(self._get_iterator_method(is_async=is_async))
        class_declaration.add_method(self._get_start_listening_method(is_async=is_async))
        if self._websocket and self._websocket.messages:
            for msg in self._websocket.messages:
                union = msg.body.get_as_union()
                if (
                    msg.origin == ir_types.WebSocketMessageOrigin.CLIENT
                    and union.type == "reference"
                    and hasattr(union, "body_type")
                ):
                    class_declaration.add_method(self._get_send_message_method(msg, is_async=is_async))
        class_declaration.add_method(self._get_recv_method(is_async=is_async))
        class_declaration.add_method(self._get_send_method(is_async=is_async))
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
            writer.write_line("super().__init__()")
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

    def _get_start_listening_method(self, is_async: bool) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="start_listening",
            is_async=is_async,
            signature=AST.FunctionSignature(),
            docstring=AST.CodeWriter(self._get_start_listening_docstring()),
            body=AST.CodeWriter(self._get_start_listening_method_body(is_async=is_async)),
        )

    def _get_start_listening_docstring(self) -> CodeWriterFunction:
        def _write_docstring(writer: AST.NodeWriter) -> None:
            writer.write_line("Start listening for messages on the websocket connection.")
            writer.write_line("")
            writer.write_line("Emits events in the following order:")
            writer.write_line("- EventType.OPEN when connection is established")
            writer.write_line("- EventType.MESSAGE for each message received")
            writer.write_line("- EventType.ERROR if an error occurs")
            writer.write_line("- EventType.CLOSE when connection is closed")

        return _write_docstring

    def _get_start_listening_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_start_listening_method_body(writer: AST.NodeWriter) -> None:
            emit_call_start = "await self._emit_async(" if is_async else "self._emit("
            writer.write(emit_call_start)
            writer.write_reference(self._context.core_utilities.get_event_type())
            writer.write(".OPEN, None)")
            writer.write_line()
            writer.write_line("try:")
            with writer.indent():
                writer.write_line(
                    f"{'async ' if is_async else ''}for raw_message in self.{self.WEBSOCKET_MEMBER_NAME}:"
                )
                with writer.indent():
                    writer.write_line("json_data = json.loads(raw_message)")
                    writer.write("parsed = ")
                    writer.write_reference(self._context.core_utilities.get_parse_obj_as())
                    writer.write(f"({self._get_response_type_name()}, json_data)  # type: ignore")
                    writer.write_line()
                    writer.write(emit_call_start)
                    writer.write_reference(self._context.core_utilities.get_event_type())
                    writer.write(".MESSAGE, parsed)")
                    writer.write_line()
            writer.write("except (")
            writer.write_reference(Websockets.get_websocket_exception())
            writer.write(", ")
            writer.write_reference(Json.JSONDecodeError())
            writer.write(") as exc:")
            writer.write_line()
            with writer.indent():
                writer.write(emit_call_start)
                writer.write_reference(self._context.core_utilities.get_event_type())
                writer.write(".ERROR, exc)")
                writer.write_line()
            writer.write_line("finally:")
            with writer.indent():
                writer.write(emit_call_start)
                writer.write_reference(self._context.core_utilities.get_event_type())
                writer.write(".CLOSE, None)")
                writer.write_line()

        return _get_start_listening_method_body

    def _get_send_message_method(self, message: ir_types.WebSocketMessage, is_async: bool) -> AST.FunctionDeclaration:
        union = message.body.get_as_union()
        fn_name = f"send_{snake_case(message.type)}"
        if not hasattr(union, "body_type"):
            param_name = snake_case(message.type)
            # Create a fallback for non-reference messages
            return AST.FunctionDeclaration(
                name=fn_name,
                is_async=is_async,
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=param_name,
                            type_hint=AST.TypeHint.any(),
                        ),
                    ],
                    return_type=AST.TypeHint.none(),
                ),
                body=AST.CodeWriter(self._get_send_message_method_body(param_name, is_async=is_async)),
                docstring=AST.CodeWriter(self._get_send_message_docstring(message_type=AST.TypeHint.any())),
            )

        message_type = union.body_type  # type: ignore
        message_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(message_type)

        # inline parameters if possible
        inlined_params = self._get_inlined_parameters_for_message_type(message_type)
        if inlined_params is not None:
            return AST.FunctionDeclaration(
                name=fn_name,
                is_async=is_async,
                signature=AST.FunctionSignature(
                    named_parameters=inlined_params,
                    return_type=AST.TypeHint.none(),
                ),
                body=AST.CodeWriter(self._get_inlined_send_message_method_body(message_type, inlined_params, is_async)),
                docstring=AST.CodeWriter(self._get_inlined_send_message_docstring(message_type, inlined_params)),
            )

        # otherwise, use a single message parameter
        param_name = snake_case(message.type)
        return AST.FunctionDeclaration(
            name=fn_name,
            is_async=is_async,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name=param_name,
                        type_hint=message_type_hint,
                    ),
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(self._get_send_message_method_body(param_name, is_async=is_async)),
            docstring=AST.CodeWriter(self._get_send_message_docstring(message_type=message_type_hint)),
        )

    def _get_property_name(self, property: ir_types.ObjectProperty) -> str:
        return property.name.name.snake_case.safe_name

    def _get_inlined_parameters_for_message_type(self, message_type: ir_types.TypeReference) -> Optional[List[AST.NamedFunctionParameter]]:
        # to inline, must be a named type ref to an object type
        union = message_type.get_as_union()
        if union.type != "named":
            return None

        type_declaration = self._context.pydantic_generator_context.get_declaration_for_type_id(
            union.type_id)
        shape_union = type_declaration.shape.get_as_union()
        if shape_union.type != "object":
            return None

        # extract object properties for inlined parameters
        parameters = []
        for prop in shape_union.properties:
            # skip literal properties (they will be set automatically)
            if self._is_type_literal(prop.value_type):
                continue

            param_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                prop.value_type, in_endpoint=True
            )
            initializer = self._context.pydantic_generator_context.get_initializer_for_type_reference(
                prop.value_type
            )

            parameters.append(
                AST.NamedFunctionParameter(
                    name=self._get_property_name(prop),
                    type_hint=param_type_hint,
                    docs=prop.docs,
                    initializer=initializer,
                    raw_type=prop.value_type,
                    raw_name=prop.name.wire_value,
                )
            )

        return parameters if parameters else None

    def _get_inlined_send_message_docstring(
        self,
        message_type: ir_types.TypeReference,
        parameters: List[AST.NamedFunctionParameter],
    ) -> CodeWriterFunction:
        def _write_docstring(writer: AST.NodeWriter) -> None:
            writer.write_line("Send a message to the websocket connection.")
            if len(parameters) == 0:
                return
            writer.write_line()
            writer.write_line("Parameters")
            writer.write_line("----------")
            for i, param in enumerate(parameters):
                if i > 0:
                    writer.write_line()
                    writer.write_line()

                writer.write(f"{param.name} : ")
                if param.type_hint is not None:
                    writer.write_node(param.type_hint)
            writer.write_line()

        return _write_docstring

    def _get_inlined_send_message_method_body(
        self,
        message_type: ir_types.TypeReference,
        parameters: List[AST.NamedFunctionParameter],
        is_async: bool,
    ) -> CodeWriterFunction:
        def _get_method_body(writer: AST.NodeWriter) -> None:
            union = message_type.get_as_union()
            if union.type != "named":
                raise ValueError(f"Expected named type reference, got {union.type}")

            # construct the message object from individual parameters
            type_declaration = self._context.pydantic_generator_context.get_declaration_for_type_id(
                union.type_id)
            message_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                message_type)

            writer.write("message = ")
            writer.write_node(message_type_hint)
            writer.write("(")

            param_assignments = []
            for param in parameters:
                param_assignments.append(f"{param.name}={param.name}")

            # add any literal properties
            shape_union = type_declaration.shape.get_as_union()
            if shape_union.type == "object":
                for prop in shape_union.properties:
                    prop_name = self._get_property_name(prop)
                    if self._is_type_literal(prop.value_type):
                        literal_value = self._context.get_literal_value(prop.value_type)
                        if isinstance(literal_value, str):
                            param_assignments.append(f'{prop_name}="{literal_value}"')
                        else:
                            param_assignments.append(f"{prop_name}={literal_value}")

            writer.write(", ".join(param_assignments))
            writer.write(")")
            writer.write_line()
            writer.write_line(f"{'await ' if is_async else ''}self._send_model(message)")

        return _get_method_body

    def _get_send_message_docstring(self, message_type: AST.TypeHint) -> CodeWriterFunction:
        def _write_docstring(writer: AST.NodeWriter) -> None:
            writer.write_line("Send a message to the websocket connection.")
            writer.write("The message will be sent as a ")
            writer.write_node(message_type)
            writer.write_line(".")

        return _write_docstring

    def _get_send_message_method_body(self, param_name: str, is_async: bool) -> CodeWriterFunction:
        def _get_send_message_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"{'await ' if is_async else ''}self._send_model({param_name})")

        return _get_send_message_method_body

    def _get_recv_method(self, is_async: bool) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="recv",
            is_async=is_async,
            signature=AST.FunctionSignature(
                return_type=self._get_response_type_name(),
            ),
            body=AST.CodeWriter(self._get_recv_method_body(is_async=is_async)),
            docstring=AST.CodeWriter(self._get_recv_method_docstring()),
        )

    def _get_recv_method_docstring(self) -> CodeWriterFunction:
        def _write_docstring(writer: AST.NodeWriter) -> None:
            writer.write_line("Receive a message from the websocket connection.")

        return _write_docstring

    def _get_recv_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_recv_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"data = {'await ' if is_async else ''}self.{self.WEBSOCKET_MEMBER_NAME}.recv()")
            writer.write_line("json_data = json.loads(data)")
            writer.write("return ")
            writer.write_reference(self._context.core_utilities.get_parse_obj_as())
            writer.write(f"({self._get_response_type_name()}, json_data)  # type: ignore")

        return _get_recv_method_body

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
            docstring=AST.CodeWriter(self._get_send_method_docstring()),
        )

    def _get_send_method_docstring(self) -> CodeWriterFunction:
        def _write_docstring(writer: AST.NodeWriter) -> None:
            writer.write_line("Send a message to the websocket connection.")

        return _write_docstring

    def _get_send_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_send_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line("if isinstance(data, dict):")
            with writer.indent():
                writer.write("data = ")
                writer.write_node(Json.dumps(AST.Expression("data")))
                writer.write_line()
            writer.write_line(f"{'await ' if is_async else ''}self.{self.WEBSOCKET_MEMBER_NAME}.send(data)")

        return _get_send_method_body

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
            docstring=AST.CodeWriter(self._get_send_model_method_docstring()),
        )

    def _get_send_model_method_docstring(self) -> CodeWriterFunction:
        def _write_docstring(writer: AST.NodeWriter) -> None:
            writer.write_line("Send a Pydantic model to the websocket connection.")

        return _write_docstring

    def _get_send_model_method_body(self, is_async: bool) -> CodeWriterFunction:
        def _get_send_model_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"{'await ' if is_async else ''}self._send(data.dict())")

        return _get_send_model_method_body

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None
