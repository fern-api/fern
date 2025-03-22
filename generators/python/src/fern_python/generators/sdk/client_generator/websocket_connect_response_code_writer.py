from typing import Callable, Optional

from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext


class WebsocketConnectResponseCodeWriter:
    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        is_async: bool,
    ):
        self._context = context
        self._is_async = is_async

    def get_writer(self) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("except websockets.exceptions.InvalidStatusCode as exc:")
            with writer.indent():
                writer.write_line("status_code: int = exc.status_code")
                writer.write_line("if status_code == 401:")
                with writer.indent():
                    writer.write_line("raise ApiError(")
                    with writer.indent():
                        writer.write_line("status_code=status_code,")
                        writer.write_line('body="Websocket initialized with invalid credentials.",')
                    writer.write_line(") from exc")
                writer.write_line("raise ApiError(")
                with writer.indent():
                    writer.write_line("status_code=status_code,")
                    writer.write_line('body="Unexpected error when initializing websocket connection.",')
                writer.write_line(") from exc")

        return AST.CodeWriter(write)
