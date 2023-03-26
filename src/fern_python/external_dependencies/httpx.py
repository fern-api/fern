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
    @staticmethod
    def make_request(
        *,
        url: AST.Expression,
        method: str,
        query_parameters: List[Tuple[str, AST.Expression]],
        request_body: Optional[AST.Expression],
        headers: Optional[AST.Expression],
        auth: Optional[AST.Expression],
        response_variable_name: str,
    ) -> AST.Expression:
        def write(writer: AST.NodeWriter) -> None:
            writer.write(f"{response_variable_name} = ")
            writer.write_reference(
                AST.ClassReference(qualified_name_excluding_import=(), import_=AST.ReferenceImport(module=HTTPX_MODULE))
            )
            writer.write(f'.request("{method}", ')
            writer.write_node(url)
            writer.write(", ")
            with writer.indent():
                if len(query_parameters) > 0:
                    writer.write("params={")

                    for i, (query_parameter_key, query_parameter_value) in enumerate(query_parameters):
                        if i > 0:
                            writer.write(", ")
                        writer.write(f'"{query_parameter_key}": ')
                        writer.write_node(query_parameter_value)

                    writer.write_line("},")

                if request_body is not None:
                    writer.write("json=")
                    writer.write_node(request_body)
                    writer.write_line(",")

                if headers is not None:
                    writer.write("headers=")
                    writer.write_node(headers)
                    writer.write_line(",")

                if auth is not None:
                    writer.write("auth=")
                    writer.write_node(auth)
                    writer.write_line(",")

            writer.write_line(")")

        return AST.Expression(AST.CodeWriter(write))
