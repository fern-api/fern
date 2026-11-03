import enum
import re
from typing import Optional

from fern_python.codegen import AST
from fern_python.codegen.ast.dependency.dependency import DependencyCompatibility

HTTPX_MIN_VERSION = "0.21.2"
HTTPX2_MIN_VERSION = "2.0.0"

# `import httpx...`/`from httpx...` lines that still reference the httpx module itself.
# `\b` keeps `httpx2` and `httpx_sse` from matching.
_PLAIN_HTTPX_IMPORT = re.compile(r"^[ \t]*(?:import|from)[ \t]+httpx\b.*$", re.MULTILINE)


class HttpxPackage(str, enum.Enum):
    """The distribution that provides the httpx API to the generated SDK.

    `httpx2` (https://github.com/pydantic/httpx2) is an API-compatible fork of
    httpx 0.28. Generated code imports it as `import httpx2 as httpx`, so every
    `httpx.<name>` reference in the generated and core-utility code is unchanged.
    """

    HTTPX = "httpx"
    HTTPX2 = "httpx2"

    @property
    def import_name(self) -> str:
        """The top-level module to import (`httpx` or `httpx2`)."""
        return self.value

    @property
    def import_line(self) -> str:
        """The import statement for hand-written code that refers to `httpx.<name>`."""
        if self == HttpxPackage.HTTPX:
            return "import httpx"
        return f"import {self.import_name} as httpx"

    @property
    def min_version(self) -> str:
        return HTTPX_MIN_VERSION if self == HttpxPackage.HTTPX else HTTPX2_MIN_VERSION

    def rewrite_imports(self, source: str) -> str:
        """Point `httpx` imports in hand-written source (core utilities, copied tests) at this package."""
        if self == HttpxPackage.HTTPX:
            return source
        source = re.sub(r"^([ \t]*)import httpx$", rf"\1{self.import_line}", source, flags=re.MULTILINE)
        source = re.sub(r"^([ \t]*)from httpx(\.| )", rf"\1from {self.import_name}\2", source, flags=re.MULTILINE)
        # Fail generation rather than emit an SDK that silently still needs httpx, e.g. if a
        # copied file gains an import form the rewrites above don't cover.
        remaining = _PLAIN_HTTPX_IMPORT.findall(source)
        if remaining:
            raise ValueError(
                f"Unrewritten httpx import(s) for httpx_package '{self.value}': "
                + ", ".join(repr(line.strip()) for line in remaining)
            )
        return source


def get_httpx_module(package: HttpxPackage = HttpxPackage.HTTPX) -> AST.Module:
    return AST.Module.external(
        module_path=(package.import_name,),
        dependency=AST.Dependency(
            name=package.value,
            version=package.min_version,
            compatibility=DependencyCompatibility.GREATER_THAN_OR_EQUAL,
        ),
    )


class HttpX:
    """References into the httpx API, bound to the configured `HttpxPackage`."""

    _ASYNC_CLIENT_NAME = "_client"
    STREAM_FUNC_NAME = "_stream"

    def __init__(self, package: HttpxPackage = HttpxPackage.HTTPX, *, import_as_httpx: bool = True) -> None:
        """`import_as_httpx=False` emits `import httpx2` instead of `import httpx2 as httpx`
        (for user-facing snippets such as the README)."""
        self.package = package
        self._import_as_httpx = import_as_httpx
        self.module = get_httpx_module(package)
        self.ASYNC_CLIENT = self._class_reference("AsyncClient")
        self.CLIENT = self._class_reference("Client")
        self.BASIC_AUTH = self._class_reference("BasicAuth")
        self.BASE_TRANSPORT = self._class_reference("BaseTransport")
        self.ASYNC_BASE_TRANSPORT = self._class_reference("AsyncBaseTransport")
        self.HTTP_TRANSPORT = self._class_reference("HTTPTransport")
        self.ASYNC_HTTP_TRANSPORT = self._class_reference("AsyncHTTPTransport")

    def _reference_import(self) -> AST.ReferenceImport:
        # httpx2 is imported under the `httpx` name so hand-written `httpx.<name>`
        # expressions in generated code resolve regardless of the package.
        alias = "httpx" if self.package != HttpxPackage.HTTPX and self._import_as_httpx else None
        return AST.ReferenceImport(module=self.module, alias=alias)

    def _class_reference(self, name: str) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(name,),
            import_=self._reference_import(),
        )

    def query_params(self) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=("QueryParams",),
                    import_=self._reference_import(),
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
        content_type: Optional[str],
        response_variable_name: str,
        request_options_variable_name: str,
        is_async: bool,
        stream_response_type: Optional[AST.TypeHint],
        response_code_writer: AST.CodeWriter,
        reference_to_client: AST.Expression,
        is_default_body_parameter_used: bool,
        is_body_optional: bool = False,
        force_multipart: bool = False,
        emit_sse_reconnect: bool = False,
        reconnect_variable_name: str = "_reconnect",
    ) -> AST.Expression:
        last_event_id_param = "last_event_id"

        def add_request_params(*, writer: AST.NodeWriter, reconnect_last_event_id_var: Optional[str] = None) -> None:
            if query_parameters is not None:
                writer.write("params=")
                writer.write_node(query_parameters)
                writer.write_line(",")

            if request_body is not None:
                writer.write(
                    "data="
                    if files is not None
                    or (content_type is not None and (content_type == "application/x-www-form-urlencoded"))
                    else "json="
                )
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

            if reconnect_last_event_id_var is not None:
                # Reconnect re-issues the original request, adding the
                # Last-Event-ID header so the server resumes the stream.
                writer.write("headers=")
                if headers is not None:
                    writer.write("{**(")
                    writer.write_node(headers)
                    writer.write(f' or {{}}), "Last-Event-ID": {reconnect_last_event_id_var}}}')
                else:
                    writer.write(f'{{"Last-Event-ID": {reconnect_last_event_id_var}}}')
                writer.write_line(",")
            elif headers is not None:
                writer.write("headers=")
                writer.write_node(headers)
                writer.write_line(",")

            writer.write(f"request_options={request_options_variable_name},")

            if is_default_body_parameter_used:
                writer.write_line("omit=OMIT,")

            if is_body_optional:
                writer.write_line("optional_body=True,")

            if force_multipart:
                writer.write("force_multipart=")
                writer.write("True")
                writer.write_line(",")

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

        def write_reconnect_closure(*, writer: AST.NodeWriter) -> None:
            # A closure that re-issues the original streaming request with a
            # Last-Event-ID header. Returns the streaming context manager (sync
            # or async) so EventSource can transparently resume a dropped stream.
            writer.write_line(f"def {reconnect_variable_name}({last_event_id_param}: str):")
            with writer.indent():
                writer.write("return ")
                writer.write_node(reference_to_client)
                writer.write_line(".stream(")
                with writer.indent():
                    if path is not None:
                        writer.write_node(path)
                        writer.write(",")
                    if url is not None:
                        writer.write("base_url=")
                        writer.write_node(url)
                        writer.write(",")
                    writer.write_line(f'method="{method}",')
                    add_request_params(writer=writer, reconnect_last_event_id_var=last_event_id_param)
                writer.write_line(")")
            writer.write_newline_if_last_line_not()

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
                if emit_sse_reconnect:
                    write_reconnect_closure(writer=writer)
                writer.write_node(
                    AST.FunctionDeclaration(
                        name=HttpX.STREAM_FUNC_NAME,
                        signature=AST.FunctionSignature(
                            return_type=stream_response_type,
                        ),
                        body=response_code_writer,
                        is_async=is_async,
                    )
                )
                writer.write_newline_if_last_line_not()
                if is_async:
                    writer.write(f"yield await {HttpX.STREAM_FUNC_NAME}()")
                else:
                    writer.write(f"yield {HttpX.STREAM_FUNC_NAME}()")

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
