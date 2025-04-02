from fern_python.codegen import AST
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext


class WebsocketConnectResponseCodeWriter:
    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
    ):
        self._context = context

    def write(self, writer: AST.NodeWriter) -> None:
        writer.write_line("except websockets.exceptions.InvalidStatusCode as exc:")
        with writer.indent():
            writer.write_line("status_code: int = exc.status_code")
            writer.write_line("if status_code == 401:")
            with writer.indent():
                writer.write("raise ")
                writer.write_node(
                    self._context.core_utilities.instantiate_api_error(
                        body=AST.Expression('"Websocket initialized with invalid credentials."'),
                        status_code=AST.Expression("status_code"),
                    )
                )
            writer.write("raise ")
            writer.write_node(
                self._context.core_utilities.instantiate_api_error(
                    body=AST.Expression('"Unexpected error when initializing websocket connection."'),
                    status_code=AST.Expression("status_code"),
                )
            )
            writer.write_line("")
