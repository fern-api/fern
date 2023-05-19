from typing import List, Optional, Tuple

from fern_python.codegen import AST

HTTPX_MODULE = AST.Module.external(
    module_path=("httpx",),
    dependency=AST.Dependency(
        name="httpx",
        version="0.23.3",
    ),
)


class HttpX:
    _ASYNC_CLIENT_NAME = "_client"

    @staticmethod
    def make_request(
        *,
        url: AST.Expression,
        method: str,
        query_parameters: List[Tuple[str, AST.Expression]],
        request_body: Optional[AST.Expression],
        headers: Optional[AST.Expression],
        files: Optional[AST.Expression],
        auth: Optional[AST.Expression],
        timeout: AST.Expression,
        response_variable_name: str,
        is_async: bool,
        is_streaming: bool,
        response_code_writer: AST.CodeWriter,
    ) -> AST.Expression:
        def add_request_params(*, writer: AST.NodeWriter, reference_to_client: AST.Expression) -> None:
            if len(query_parameters) > 0:
                writer.write("params={")

                for i, (query_parameter_key, query_parameter_value) in enumerate(query_parameters):
                    if i > 0:
                        writer.write(", ")
                    writer.write(f'"{query_parameter_key}": ')
                    writer.write_node(query_parameter_value)

                writer.write_line("},")

            if request_body is not None:
                writer.write("data=" if files is not None else "json=")
                writer.write_node(request_body)
                writer.write_line(",")

            if files is not None:
                writer.write("files=")
                writer.write_node(files)
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

        def write_non_streaming_call(
            *, writer: AST.NodeWriter, reference_to_client: AST.Expression, indent_request: bool
        ) -> None:
            if indent_request:
                with writer.indent():
                    make_non_streaming_request(writer=writer, reference_to_client=reference_to_client)
            else:
                make_non_streaming_request(writer=writer, reference_to_client=reference_to_client)
            response_code_writer.write(writer=writer)

        def make_non_streaming_request(
            *,
            writer: AST.NodeWriter,
            reference_to_client: AST.Expression,
        ) -> None:
            writer.write(f"{response_variable_name} = ")
            if is_async:
                writer.write("await ")
            writer.write_node(reference_to_client)
            writer.write(f'.request("{method}", ')
            writer.write_node(url)
            writer.write(", ")
            with writer.indent():
                add_request_params(writer=writer, reference_to_client=reference_to_client)
            writer.write_line(")")

        def write_streaming_call(*, writer: AST.NodeWriter, reference_to_client: AST.Expression) -> None:
            if is_async:
                writer.write("async ")
            writer.write("with ")
            writer.write_node(reference_to_client)
            writer.write(f'.stream("{method}", ')
            writer.write_node(url)
            writer.write(", ")
            with writer.indent():
                add_request_params(writer=writer, reference_to_client=reference_to_client)
            writer.write_line(f") as {response_variable_name}:")

            with writer.indent():
                response_code_writer.write(writer=writer)

        def write(writer: AST.NodeWriter) -> None:
            if is_async:
                writer.write("async with ")
                writer.write_node(
                    AST.ClassInstantiation(
                        class_=AST.ClassReference(
                            qualified_name_excluding_import=("AsyncClient",),
                            import_=AST.ReferenceImport(module=HTTPX_MODULE),
                        )
                    )
                )
                writer.write_line(f" as {HttpX._ASYNC_CLIENT_NAME}:")
                if is_streaming:
                    with writer.indent():
                        write_streaming_call(
                            writer=writer,
                            reference_to_client=AST.Expression(HttpX._ASYNC_CLIENT_NAME),
                        )
                else:
                    write_non_streaming_call(
                        writer=writer,
                        reference_to_client=AST.Expression(HttpX._ASYNC_CLIENT_NAME),
                        indent_request=True,
                    )
            else:
                if is_streaming:
                    write_streaming_call(
                        writer=writer,
                        reference_to_client=AST.Expression(
                            AST.ClassReference(
                                qualified_name_excluding_import=(), import_=AST.ReferenceImport(module=HTTPX_MODULE)
                            )
                        ),
                    )
                else:
                    write_non_streaming_call(
                        writer=writer,
                        reference_to_client=AST.Expression(
                            AST.ClassReference(
                                qualified_name_excluding_import=(), import_=AST.ReferenceImport(module=HTTPX_MODULE)
                            )
                        ),
                        indent_request=False,
                    )

        return AST.Expression(AST.CodeWriter(write))
