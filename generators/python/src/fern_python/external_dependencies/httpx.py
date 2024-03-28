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
    def make_request(
        *,
        url: AST.Expression,
        method: str,
        query_parameters: Optional[AST.Expression],
        request_body: Optional[AST.Expression],
        headers: Optional[AST.Expression],
        files: Optional[AST.Expression],
        content: Optional[AST.Expression],
        auth: Optional[AST.Expression],
        timeout: AST.Expression,
        response_variable_name: str,
        is_async: bool,
        is_streaming: bool,
        response_code_writer: AST.CodeWriter,
        reference_to_client: AST.Expression,
        max_retries: AST.Expression,
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

            if auth is not None:
                writer.write("auth=")
                writer.write_node(auth)
                writer.write_line(",")

            writer.write("timeout=")
            writer.write_node(timeout)
            writer.write_line(",")

            writer.write("retries=0")
            writer.write_line(",")

            writer.write("max_retries=")
            writer.write_node(max_retries)
            writer.write_line(",  # type: ignore")

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
            writer.write(f'.request("{method}", ')
            writer.write_node(url)
            writer.write(", ")
            with writer.indent():
                add_request_params(writer=writer)
            writer.write_line(")")

        def write_streaming_call(*, writer: AST.NodeWriter) -> None:
            if is_async:
                writer.write("async ")
            writer.write("with ")
            if is_async:
                writer.write("await ")
            writer.write_node(reference_to_client)
            writer.write(f'.stream("{method}", ')
            writer.write_node(url)
            writer.write(", ")
            with writer.indent():
                add_request_params(writer=writer)
            writer.write_line(f") as {response_variable_name}:")

            with writer.indent():
                response_code_writer.write(writer=writer)

        def write(writer: AST.NodeWriter) -> None:
            if is_async:
                if is_streaming:
                    write_streaming_call(
                        writer=writer,
                    )
                else:
                    write_non_streaming_call(
                        writer=writer,
                    )
            else:
                if is_streaming:
                    write_streaming_call(
                        writer=writer,
                    )
                else:
                    write_non_streaming_call(
                        writer=writer,
                    )

        return AST.Expression(AST.CodeWriter(write))
