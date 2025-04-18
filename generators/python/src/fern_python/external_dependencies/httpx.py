from typing import Optional

from fern_python.codegen import AST
from fern_python.codegen.ast.dependency.dependency import DependencyCompatibility

HTTPX_MODULE = AST.Module.external(
    module_path=("httpx",),
    dependency=AST.Dependency(
        name="httpx",
        version="0.21.2",
        compatibility=DependencyCompatibility.GREATER_THAN_OR_EQUAL,
    ),
)


class HttpX:
    _ASYNC_CLIENT_NAME = "_client"

    ASYNC_CLIENT = AST.ClassReference(
        qualified_name_excluding_import=("AsyncClient",),
        import_=AST.ReferenceImport(module=HTTPX_MODULE),
    )

    CLIENT = AST.ClassReference(
        qualified_name_excluding_import=("Client",),
        import_=AST.ReferenceImport(module=HTTPX_MODULE),
    )

    BASIC_AUTH = AST.ClassReference(
        qualified_name_excluding_import=("BasicAuth",),
        import_=AST.ReferenceImport(module=HTTPX_MODULE),
    )

    @staticmethod
    def query_params() -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=("QueryParams",),
                    import_=AST.ReferenceImport(module=HTTPX_MODULE),
                ),
            )
        )

    @staticmethod
    def make_request(
        *,
        path: Optional[AST.Expression],
        url: Optional[AST.Expression],
        method: str,
        query_parameters: Optional[AST.Expression],
        request_body: Optional[AST.Expression],
        headers: Optional[AST.Expression],
        files: Optional[AST.Expression],
        content: Optional[AST.Expression],
        response_variable_name: str,
        request_options_variable_name: str,
        is_async: bool,
        stream_response_type: Optional[AST.TypeHint],
        response_code_writer: AST.CodeWriter,
        reference_to_client: AST.Expression,
        is_default_body_parameter_used: bool,
    ) -> AST.Expression:
        def add_request_params(*, writer: AST.NodeWriter) -> None:
            if query_parameters is not None:
                writer.write("params=")
                writer.write_node(query_parameters)
                writer.write_line(",")

            if request_body is not None:
                writer.write("data=" if files is not None else "json=")
                writer.write_node(request_body)
                writer.write_line(",")

            if files is not None:
                writer.write("files=")
                writer.write_node(files)
                writer.write_line(",")

            if content is not None:
                writer.write("content=")
                writer.write_node(content)
                writer.write_line(",")

            if headers is not None:
                writer.write("headers=")
                writer.write_node(headers)
                writer.write_line(",")

            writer.write(f"request_options={request_options_variable_name},")

            if is_default_body_parameter_used:
                writer.write_line("omit=OMIT,")

        def write_non_streaming_call(
            *,
            writer: AST.NodeWriter,
        ) -> None:
            make_non_streaming_request(writer=writer)
            response_code_writer.write(writer=writer)

        def make_non_streaming_request(
            *,
            writer: AST.NodeWriter,
        ) -> None:
            writer.write(f"{response_variable_name} = ")
            if is_async:
                writer.write("await ")
            writer.write_node(reference_to_client)
            writer.write_line(".request(")

            with writer.indent():
                if path is not None:
                    writer.write_node(path)
                    writer.write(",")
                if url is not None:
                    writer.write("base_url=")
                    writer.write_node(url)
                    writer.write(",")
                writer.write_line(f'method="{method}",')
                add_request_params(writer=writer)
            writer.write_line(")")

        def write_streaming_call(*, writer: AST.NodeWriter) -> None:
            if is_async:
                writer.write("async ")
            writer.write("with ")
            writer.write_node(reference_to_client)
            writer.write(".stream(")

            with writer.indent():
                if path is not None:
                    writer.write_node(path)
                    writer.write(",")
                if url is not None:
                    writer.write("base_url=")
                    writer.write_node(url)
                    writer.write(",")
                writer.write_line(f'method="{method}",')
                add_request_params(writer=writer)
            writer.write_line(f") as {response_variable_name}:")

            with writer.indent():
                writer.write_node(
                    AST.FunctionDeclaration(
                        name="stream",
                        signature=AST.FunctionSignature(
                            return_type=stream_response_type,
                        ),
                        body=response_code_writer,
                        is_async=is_async,
                    )
                )
                writer.write_newline_if_last_line_not()
                if is_async:
                    writer.write("yield await stream()")
                else:
                    writer.write("yield stream()")

        def write(writer: AST.NodeWriter) -> None:
            if stream_response_type is not None:
                write_streaming_call(
                    writer=writer,
                )
            else:
                write_non_streaming_call(
                    writer=writer,
                )

        return AST.Expression(AST.CodeWriter(write))
