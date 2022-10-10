from typing import List, Tuple

from fern_python.codegen import AST

FAST_API_MODULE = AST.Module.external(
    module_path=("fastapi",),
    dependency=AST.Dependency(
        name="fastapi",
        version="^0.79.0",
    ),
)


def _export(*name: str) -> AST.ClassReference:
    return AST.ClassReference(qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=FAST_API_MODULE))


class APIRouter:

    REFERENCE = _export("APIRouter")

    @staticmethod
    def invoke() -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=APIRouter.REFERENCE,
                args=[],
            )
        )


class FastAPI:
    FastAPI = AST.TypeHint(type=_export("FastAPI"))

    Body = AST.Expression(
        AST.FunctionInvocation(
            function_definition=_export(
                "Body",
            ),
            args=[AST.Expression(AST.CodeWriter("..."))],
        )
    )

    Path = AST.Expression(
        AST.FunctionInvocation(
            function_definition=_export(
                "Path",
            ),
            args=[AST.Expression(AST.CodeWriter("..."))],
        )
    )

    Request = AST.TypeHint(type=_export("requests", "Request"))

    JSONResponse = AST.TypeHint(type=_export("requests", "JSONResponse"))

    HTTPBasic = _export("security", "HTTPBasic")

    HTTPBasicCredentials = _export("security", "HTTPBasicCredentials")

    APIRouter = APIRouter

    @staticmethod
    def Depends(dependency: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=_export(
                    "Depends",
                ),
                args=[dependency],
            )
        )

    @staticmethod
    def Header(*, is_optional: bool, wire_value: str) -> AST.Expression:
        kwargs: List[Tuple[str, AST.Expression]] = []
        if is_optional:
            kwargs.append(("default", AST.Expression(AST.TypeHint.none())))
        kwargs.append(("alias", AST.Expression(AST.CodeWriter(f'"{wire_value}"'))))
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=_export(
                    "Header",
                ),
                kwargs=kwargs,
            )
        )

    @staticmethod
    def Query(*, is_optional: bool, variable_name: str, wire_value: str) -> AST.Expression:
        kwargs: List[Tuple[str, AST.Expression]] = []
        if is_optional:
            kwargs.append(("default", AST.Expression(AST.TypeHint.none())))
        if variable_name != wire_value:
            kwargs.append(("alias", AST.Expression(AST.CodeWriter(f'"{wire_value}"'))))
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=_export(
                    "Query",
                ),
                kwargs=kwargs,
            )
        )

    @staticmethod
    def include_router(*, app_variable: str, router: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(qualified_name_excluding_import=(app_variable, "include_router")),
                args=[router],
            )
        )

    EXCEPTION_HANDLER_REQUEST_ARGUMENT = "request"
    EXCEPTION_HANDLER_EXCEPTION_ARGUMENT = "exc"

    @staticmethod
    def exception_handler(
        *, app_variable: str, exception_type: AST.ClassReference, body: AST.CodeWriter
    ) -> AST.FunctionDeclaration:
        decorator = AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(qualified_name_excluding_import=(app_variable, "exception_handler")),
                args=[AST.Expression(exception_type)],
            )
        )
        return AST.FunctionDeclaration(
            name="_exception_handler",
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(name=FastAPI.EXCEPTION_HANDLER_REQUEST_ARGUMENT, type_hint=FastAPI.Request),
                    AST.FunctionParameter(
                        name=FastAPI.EXCEPTION_HANDLER_EXCEPTION_ARGUMENT, type_hint=AST.TypeHint(type=exception_type)
                    ),
                ],
                return_type=FastAPI.JSONResponse,
            ),
            decorators=[decorator],
            body=body,
        )
