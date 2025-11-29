from typing import List

import fern.ir.resources as ir_types
from ..context import FastApiGeneratorContext
from ..custom_config import FastAPICustomConfig
from .endpoint_parameters import (
    AuthEndpointParameter,
    EndpointParameter,
    HeaderEndpointParameter,
    InlinedRequestEndpointParameter,
    PathEndpointParameter,
    QueryEndpointParameter,
    ReferencedRequestEndpointParameter,
)
from typing_extensions import Never

from fern_python.codegen import AST
from fern_python.external_dependencies import FastAPI
from fern_python.external_dependencies.starlette import Starlette
from fern_python.generators.fastapi.service_generator.endpoint_parameters.request.file_upload_request_endpoint_parameter import (
    FileUploadRequestEndpointParameters,
)


class EndpointGenerator:
    _INIT_ENDPOINT_ROUTER_ARG = "router"

    def __init__(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        context: FastApiGeneratorContext,
    ):
        self._service = service
        self._endpoint = endpoint
        self._context = context

        self._custom_config = FastAPICustomConfig.parse_obj(self._context.generator_config.custom_config or {})

        self._is_async = self.is_async()

        self._parameters: List[EndpointParameter] = []
        if endpoint.request_body is not None:
            self._parameters.extend(
                endpoint.request_body.visit(
                    inlined_request_body=lambda request: [
                        InlinedRequestEndpointParameter(
                            context=context,
                            request=request,
                            service_name=self._service.name,
                        )
                    ],
                    reference=lambda request: [
                        ReferencedRequestEndpointParameter(context=context, request_type=request.request_body_type)
                    ],
                    file_upload=lambda request: FileUploadRequestEndpointParameters(
                        context=context, request=request
                    ).get_parameters(),
                    bytes=lambda request: raise_bytes_unsupported(),
                )
            )
        for path_parameter in service.path_parameters:
            self._parameters.append(PathEndpointParameter(context=context, path_parameter=path_parameter))
        for path_parameter in endpoint.path_parameters:
            self._parameters.append(PathEndpointParameter(context=context, path_parameter=path_parameter))
        for query_parameter in endpoint.query_parameters:
            self._parameters.append(QueryEndpointParameter(context=context, query_parameter=query_parameter))
        for header_parameter in endpoint.headers:
            self._parameters.append(HeaderEndpointParameter(context=context, header=header_parameter))
        for global_header in context.ir.headers:
            self._parameters.append(HeaderEndpointParameter(context=context, header=global_header))
        if endpoint.auth:
            self._parameters.append(AuthEndpointParameter(context=context))

    def get_endpoint_dot_delimited_path(self) -> str:
        service_path = [part.original_name for part in self._service.name.fern_filepath.all_parts]
        endpoint = self._endpoint.name.original_name
        return f"{'.'.join(service_path)}.{endpoint}"

    def is_async(self) -> bool:
        if isinstance(self._custom_config.async_handlers, bool):
            return self._custom_config.async_handlers
        else:
            return self.get_endpoint_dot_delimited_path() in self._custom_config.async_handlers

    def add_abstract_method_to_class(self, class_declaration: AST.ClassDeclaration) -> None:
        class_declaration.add_abstract_method(
            name=self._get_method_name(),
            signature=AST.FunctionSignature(
                named_parameters=[parameter.to_function_parameter() for parameter in self._parameters],
                return_type=self._get_return_type(),
            ),
            docstring=AST.Docstring(self._endpoint.docs) if self._endpoint.docs is not None else None,
            is_async=self._is_async,
        )

    def _get_is_return_type_pydantic_model(self) -> bool:
        if self._endpoint.response is None or self._endpoint.response.body is None:
            return True
        return self._endpoint.response.body.visit(
            file_download=lambda _: False,
            text=lambda _: True,
            json=lambda json_response: True,
            streaming=lambda _: True,
            stream_parameter=lambda _: True,
            bytes=lambda _: False,
        )

    def _get_return_type(self) -> AST.TypeHint:
        response = self._endpoint.response
        if response is None or response.body is None:
            return AST.TypeHint.none()
        return self._get_response_body_type(response.body)

    def _get_endpoint_path(self) -> str:
        # remove leading slashes from the head and add a single one
        head = self._endpoint.full_path.head

        if not head.startswith("/"):
            head = f"/{head}"

        if len(self._endpoint.full_path.parts) == 0:
            return head

        full_path = head
        for i, part in enumerate(self._endpoint.full_path.parts):
            parameter_obj = self._endpoint.all_path_parameters[i]
            full_path += self._get_path_parameter_part_as_str(parameter_obj, part.tail)

        return full_path

    def _get_path_parameter_part_as_str(self, path_parameter: ir_types.PathParameter, tail: str) -> str:
        path = ""
        path += "{" + PathEndpointParameter.get_variable_name_of_path_parameter(path_parameter) + "}"
        path += tail
        return path

    def add_init_method_to_class(self, class_declaration: AST.ClassDeclaration) -> None:
        class_declaration.add_method(
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
            declaration=AST.FunctionDeclaration(
                name=self._get_init_method_name(),
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=EndpointGenerator._INIT_ENDPOINT_ROUTER_ARG,
                            type_hint=AST.TypeHint(type=FastAPI.APIRouter.REFERENCE),
                        )
                    ],
                    return_type=AST.TypeHint.none(),
                ),
                body=AST.CodeWriter(self._get_write_init_body(class_declaration=class_declaration)),
            ),
        )

    def _get_write_init_body(self, class_declaration: AST.ClassDeclaration) -> AST.CodeWriterFunction:
        def _write_init_body(writer: AST.NodeWriter) -> None:
            method_on_cls = self._get_reference_to_method_on_cls()

            self._write_update_endpoint_signature(writer=writer)
            writer.write_line()

            _TRY_EXCEPT_WRAPPER_NAME = "wrapper"
            writer.write_node(
                node=AST.FunctionDeclaration(
                    name=_TRY_EXCEPT_WRAPPER_NAME,
                    body=AST.CodeWriter(self._write_try_except_wrapper_body),
                    signature=AST.FunctionSignature(
                        include_args=True, include_kwargs=True, return_type=self._get_return_type()
                    ),
                    decorators=[
                        AST.FunctionInvocation(
                            function_definition=AST.Reference(
                                qualified_name_excluding_import=("wraps",),
                                import_=AST.ReferenceImport(module=AST.Module.built_in(("functools",))),
                            ),
                            args=[AST.Expression(method_on_cls)],
                        )
                    ],
                    is_async=self._is_async,
                )
            )
            writer.write_line()

            writer.write_line("# this is necessary for FastAPI to find forward-ref'ed type hints.")
            writer.write_line("# https://github.com/tiangolo/fastapi/pull/5077")
            writer.write_line(
                f"{_TRY_EXCEPT_WRAPPER_NAME}.__globals__.update("
                + self._get_reference_to_method_on_cls()
                + ".__globals__)"
            )
            writer.write_line()

            writer.write(f"{EndpointGenerator._INIT_ENDPOINT_ROUTER_ARG}.")
            writer.write(convert_http_method_to_fastapi_method_name(self._endpoint.method))
            writer.write_line("(")
            with writer.indent():
                writer.write_line(f'path="{self._get_endpoint_path()}",')

                # Void responses make more sense as response_class, but keeping as response_model to not modify existing users
                if not self._get_is_return_type_pydantic_model():
                    writer.write("response_class=")
                else:
                    writer.write("response_model=")

                if self._endpoint.response is not None:
                    writer.write_node(self._get_return_type())
                else:
                    writer.write("None")
                writer.write_line(",")

                if self._endpoint.response is None or self._endpoint.response.body is None:
                    writer.write("status_code=")
                    writer.write_node(AST.TypeHint(Starlette.HTTP_204_NO_CONTENT))
                    writer.write_line(",")
                writer.write(f"description={class_declaration.name}.{self._get_method_name()}.__doc__")
                writer.write_line(",")
                writer.write("**")
                default_tag = ".".join(
                    [package.snake_case.safe_name for package in self._service.name.fern_filepath.all_parts]
                )
                writer.write_node(
                    self._context.core_utilities.get_route_args(
                        endpoint_method=AST.Expression(method_on_cls),
                        default_tag=default_tag,
                    )
                )
                writer.write_line(",")
            writer.write(f")({_TRY_EXCEPT_WRAPPER_NAME})")

        return _write_init_body

    def _write_update_endpoint_signature(self, writer: AST.NodeWriter) -> None:
        method_on_cls = self._get_reference_to_method_on_cls()

        ENDPOINT_FUNCTION_VARIABLE_NAME = "endpoint_function"
        writer.write(f"{ENDPOINT_FUNCTION_VARIABLE_NAME} = ")
        writer.write_node(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=("signature",),
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("inspect",))),
                ),
                args=[AST.Expression(method_on_cls)],
            )
        )
        writer.write_line()

        NEW_PARAMETERS_VARIABLE_NAME = "new_parameters"
        writer.write(f"{NEW_PARAMETERS_VARIABLE_NAME}: ")
        writer.write_node(
            AST.TypeHint.list(
                AST.TypeHint(
                    type=AST.ClassReference(
                        qualified_name_excluding_import=("Parameter",),
                        import_=AST.ReferenceImport(module=AST.Module.built_in(("inspect",))),
                    )
                )
            )
        )
        writer.write_line(" = []")

        INDEX_VARIABLE_NAME = "index"
        PARAMETER_NAME_VARIABLE_NAME = "parameter_name"
        PARAMETER_VALUE_VARIABLE_NAME = "parameter"
        writer.write_line(
            f"for {INDEX_VARIABLE_NAME}, ({PARAMETER_NAME_VARIABLE_NAME}, {PARAMETER_VALUE_VARIABLE_NAME}) "
            + f"in enumerate({ENDPOINT_FUNCTION_VARIABLE_NAME}.parameters.items()):"
        )

        with writer.indent():
            writer.write_line(f"if {INDEX_VARIABLE_NAME} == 0:")
            with writer.indent():
                writer.write(
                    f"{NEW_PARAMETERS_VARIABLE_NAME}.append(" + f"{PARAMETER_VALUE_VARIABLE_NAME}.replace(default="
                )
                writer.write_node(node=FastAPI.Depends(dependency=AST.Expression("cls")))
                writer.write_line("))")
            for i, parameter in enumerate(self._parameters):
                writer.write_line(f'elif {PARAMETER_NAME_VARIABLE_NAME} == "{parameter.get_name()}":')
                with writer.indent():
                    writer.write(
                        f"{NEW_PARAMETERS_VARIABLE_NAME}.append(" + f"{PARAMETER_VALUE_VARIABLE_NAME}.replace(default="
                    )
                    writer.write_node(parameter.get_default())
                    writer.write_line("))")
            writer.write_line("else:")
            with writer.indent():
                writer.write_line(f"{NEW_PARAMETERS_VARIABLE_NAME}.append({PARAMETER_VALUE_VARIABLE_NAME})")

        writer.write_line(
            f'setattr({method_on_cls}, "__signature__", '
            + f"{ENDPOINT_FUNCTION_VARIABLE_NAME}.replace(parameters={NEW_PARAMETERS_VARIABLE_NAME}))"
        )

    def invoke_init_method(self, *, reference_to_fastapi_router: AST.Expression) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                qualified_name_excluding_import=(self._get_reference_to_init_method_on_cls(),),
            ),
            kwargs=[(EndpointGenerator._INIT_ENDPOINT_ROUTER_ARG, reference_to_fastapi_router)],
        )

    def _get_method_name(self) -> str:
        return self._endpoint.name.snake_case.safe_name

    def _get_reference_to_method_on_cls(self) -> str:
        return f"cls.{self._get_method_name()}"

    def _get_init_method_name(self) -> str:
        return f"__init_{self._get_method_name()}"

    def _get_reference_to_init_method_on_cls(self) -> str:
        return f"cls.{self._get_init_method_name()}"

    def _write_try_except_wrapper_body(self, writer: AST.NodeWriter) -> None:
        CAUGHT_ERROR_NAME = "e"

        writer.write_line("try:")
        with writer.indent():
            return_statement = "return await" if self._is_async else "return"

            writer.write_line(f"{return_statement} {self._get_reference_to_method_on_cls()}(*args, **kwargs)")

        errors = self._endpoint.errors
        if len(errors) > 0:
            writer.write("except ")
            if len(errors) > 1:
                writer.write("(")
            for i, error in enumerate(errors):
                if i > 0:
                    writer.write(", ")
                writer.write_reference(self._context.get_reference_to_error(error.error))
            if len(errors) > 1:
                writer.write(")")
            writer.write_line(f" as {CAUGHT_ERROR_NAME}:")
            with writer.indent():
                writer.write_line("raise e")

        writer.write("except ")
        writer.write_reference(self._context.core_utilities.exceptions.FernHTTPException.get_reference_to())
        writer.write_line(f" as {CAUGHT_ERROR_NAME}:")
        with writer.indent():
            writer.write_reference(
                AST.Reference(
                    qualified_name_excluding_import=("getLogger",),
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("logging",))),
                )
            )
            writer.write_line('(f"{cls.__module__}.{cls.__name__}").warn(')
            with writer.indent():
                writer.write_line(
                    f"f\"Endpoint '{self._get_method_name()}' unexpectedly threw "
                    + f'{{{CAUGHT_ERROR_NAME}.__class__.__name__}}. "'
                )
                writer.write_line(
                    f'+ f"If this was intentional, please add {{{CAUGHT_ERROR_NAME}.__class__.__name__}} to "'
                )
                writer.write_line('+ "the endpoint\'s errors list in your Fern Definition."')
            writer.write_line(")")
            writer.write_line(f"raise {CAUGHT_ERROR_NAME}")

    def _get_response_body_type(self, response_body: ir_types.HttpResponseBody) -> AST.TypeHint:
        return response_body.visit(
            file_download=lambda _: AST.TypeHint(FastAPI.FileResponse),
            json=lambda json_response: self._get_json_response_body_type(json_response),
            text=lambda _: AST.TypeHint.str_(),
            streaming=lambda _: raise_streaming_unsupported(),
            stream_parameter=lambda _: raise_stream_parameter_unsupported(),
            bytes=lambda _: raise_bytes_response_unsupported(),
        )

    def _get_json_response_body_type(
        self,
        json_response: ir_types.JsonResponse,
    ) -> AST.TypeHint:
        return json_response.visit(
            response=lambda response: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                response.response_body_type,
                in_endpoint=True,
            ),
            nested_property_as_response=lambda _: raise_json_nested_property_as_response_unsupported(),
        )


def convert_http_method_to_fastapi_method_name(http_method: ir_types.HttpMethod) -> str:
    return http_method.visit(
        get=lambda: "get",
        post=lambda: "post",
        put=lambda: "put",
        patch=lambda: "patch",
        delete=lambda: "delete",
        head=lambda: "head",
    )


def raise_stream_parameter_unsupported() -> Never:
    raise RuntimeError("streaming parameter is not supported")


def raise_streaming_unsupported() -> Never:
    raise RuntimeError("streaming is not supported")


def raise_bytes_unsupported() -> Never:
    raise RuntimeError("bytes request is not supported")


def raise_bytes_response_unsupported() -> Never:
    raise RuntimeError("bytes response is not supported")


def raise_json_nested_property_as_response_unsupported() -> Never:
    raise RuntimeError("nested property json response is unsupported")
