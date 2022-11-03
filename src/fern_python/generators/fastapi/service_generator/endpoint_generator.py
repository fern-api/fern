from typing import List

import fern.ir.pydantic as ir_types

from fern_python.codegen import AST
from fern_python.external_dependencies import FastAPI
from fern_python.external_dependencies.starlette import Starlette

from ..context import FastApiGeneratorContext
from .endpoint_parameters import (
    AuthEndpointParameter,
    EndpointParameter,
    PathEndpointParameter,
    QueryEndpointParameter,
    RequestEndpointParameter,
)


class EndpointGenerator:
    _INIT_ENDPOINT_ROUTER_ARG = "router"

    def __init__(
        self,
        *,
        service: ir_types.services.HttpService,
        endpoint: ir_types.services.HttpEndpoint,
        context: FastApiGeneratorContext,
    ):
        self._service = service
        self._endpoint = endpoint
        self._context = context

        self._parameters: List[EndpointParameter] = []
        if endpoint.request.type_v_2 is not None:
            self._parameters.append(
                RequestEndpointParameter(
                    context=context,
                    request_type=endpoint.request.type_v_2,
                )
            )
        for path_parameter in service.path_parameters:
            self._parameters.append(PathEndpointParameter(context=context, path_parameter=path_parameter))
        for path_parameter in endpoint.path_parameters:
            self._parameters.append(PathEndpointParameter(context=context, path_parameter=path_parameter))
        for query_parameter in endpoint.query_parameters:
            self._parameters.append(QueryEndpointParameter(context=context, query_parameter=query_parameter))
        if endpoint.auth:
            self._parameters.append(AuthEndpointParameter(context=context))

    def add_abstract_method_to_class(self, class_declaration: AST.ClassDeclaration) -> None:
        class_declaration.add_abstract_method(
            name=self._get_method_name(),
            signature=AST.FunctionSignature(
                named_parameters=[parameter.to_function_parameter() for parameter in self._parameters],
                return_type=self._get_return_type(),
            ),
        )

    def _get_return_type(self) -> AST.TypeHint:
        response_type = self._endpoint.response.type_v_2
        if response_type is None:
            return AST.TypeHint.none()
        return self._context.pydantic_generator_context.get_type_hint_for_type_reference(response_type)

    def _get_endpoint_path(self) -> str:
        base_path = self._service.base_path_v_2
        service_part = (
            base_path.head
            + "".join(
                self._get_path_parameter_part_as_str(self._service.path_parameters[i], part.tail)
                for i, part in enumerate(base_path.parts)
            )
            if base_path is not None
            else ""
        )
        endpoint_part = self._endpoint.path.head + "".join(
            self._get_path_parameter_part_as_str(self._endpoint.path_parameters[i], part.tail)
            for i, part in enumerate(self._endpoint.path.parts)
        )
        if service_part.endswith("/"):
            service_part = service_part[:-1]
        if endpoint_part.startswith("/"):
            endpoint_part = endpoint_part[1:]
        if endpoint_part.endswith("/"):
            endpoint_part = endpoint_part[:-1]
        return f"{service_part}/{endpoint_part}"

    def _get_path_parameter_part_as_str(self, path_parameter: ir_types.services.PathParameter, tail: str) -> str:
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
                body=AST.CodeWriter(self._write_init_body),
            ),
        )

    def _write_init_body(self, writer: AST.NodeWriter) -> None:
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
                            import_=AST.ReferenceImport(module=AST.Module.built_in("functools")),
                        ),
                        args=[AST.Expression(method_on_cls)],
                    )
                ],
            )
        )
        writer.write_line()

        writer.write_line("# this is necessary for FastAPI to find forward-ref'ed type hints.")
        writer.write_line("# https://github.com/tiangolo/fastapi/pull/5077")
        writer.write_line(
            f"{_TRY_EXCEPT_WRAPPER_NAME}.__globals__.update(" + self._get_reference_to_method_on_cls() + ".__globals__)"
        )
        writer.write_line()

        writer.write(f"{EndpointGenerator._INIT_ENDPOINT_ROUTER_ARG}.")
        writer.write(convert_http_method_to_fastapi_method_name(self._endpoint.method))
        writer.write_line("(")
        with writer.indent():
            writer.write_line(f'path="{self._get_endpoint_path()}",')
            if self._endpoint.response.type_v_2 is not None:
                writer.write("response_model=")
                writer.write_node(self._get_return_type())
                writer.write_line(",")
            else:
                writer.write("status_code=")
                writer.write_node(AST.TypeHint(Starlette.HTTP_204_NO_CONTENT))
                writer.write_line(",")
            writer.write("**")
            writer.write_node(self._context.core_utilities.get_route_args(AST.Expression(method_on_cls)))
            writer.write_line(",")
        writer.write(f")({_TRY_EXCEPT_WRAPPER_NAME})")

    def _write_update_endpoint_signature(self, writer: AST.NodeWriter) -> None:
        method_on_cls = self._get_reference_to_method_on_cls()

        ENDPOINT_FUNCTION_VARIABLE_NAME = "endpoint_function"
        writer.write(f"{ENDPOINT_FUNCTION_VARIABLE_NAME} = ")
        writer.write_node(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=("signature",),
                    import_=AST.ReferenceImport(module=AST.Module.built_in("inspect")),
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
                        import_=AST.ReferenceImport(module=AST.Module.built_in("inspect")),
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
        return self._endpoint.name.snake_case

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
            writer.write_line(f"return {self._get_reference_to_method_on_cls()}(*args, **kwargs)")

        errors = self._endpoint.errors.get_as_list()
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
                    import_=AST.ReferenceImport(module=AST.Module.built_in("logging")),
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


def convert_http_method_to_fastapi_method_name(http_method: ir_types.services.HttpMethod) -> str:
    return http_method.visit(
        get=lambda: "get",
        post=lambda: "post",
        put=lambda: "put",
        patch=lambda: "patch",
        delete=lambda: "delete",
    )
