from typing import List, Optional, Tuple

from fern_python.codegen import AST

FAST_API_MODULE = AST.Module.external(
    module_path=("fastapi",),
    dependency=AST.Dependency(
        name="fastapi",
        version="^0.111.0",
    ),
)


def _export(*name: str) -> AST.ClassReference:
    return AST.ClassReference(qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=FAST_API_MODULE))


class JSONResponse:
    REFERENCE = _export("responses", "JSONResponse")

    @staticmethod
    def invoke(*, content: AST.Expression, status_code: AST.Expression) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=JSONResponse.REFERENCE,
                kwargs=[
                    ("content", content),
                    ("status_code", status_code),
                ],
            )
        )


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

    Path = AST.Expression(
        AST.FunctionInvocation(
            function_definition=_export(
                "Path",
            ),
            args=[AST.Expression(AST.CodeWriter("..."))],
        )
    )

    Request = AST.TypeHint(type=_export("requests", "Request"))

    HTTPException = _export("HTTPException")

    HTTPBasic = _export("security", "HTTPBasic")

    HTTPBasicCredentials = _export("security", "HTTPBasicCredentials")

    APIRouter = APIRouter

    JSONResponse = JSONResponse

    FileResponse = _export("responses", "FileResponse")

    DependsType = AST.TypeHint(
        type=AST.ClassReference(
            qualified_name_excluding_import=("Depends",),
            import_=AST.ReferenceImport(module=FAST_API_MODULE, named_import="params"),
        )
    )

    @staticmethod
    def Body(
        *,
        variable_name: Optional[str] = None,
        wire_value: Optional[str] = None,
        is_optional: bool = False,
    ) -> AST.Expression:
        body_function_definition = _export(
            "Body",
        )

        kwargs: List[Tuple[str, AST.Expression]] = []
        if is_optional:
            kwargs.append(("default", AST.Expression(AST.TypeHint.none())))
        if variable_name is not None and wire_value is not None and variable_name != wire_value:
            kwargs.append(("alias", AST.Expression(AST.CodeWriter(f'"{wire_value}"'))))

        if len(kwargs) > 0:
            return AST.Expression(
                AST.FunctionInvocation(
                    function_definition=body_function_definition,
                    kwargs=kwargs,
                )
            )
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=body_function_definition,
                args=[AST.Expression(AST.CodeWriter("..."))],
            )
        )

    @staticmethod
    def Form(
        *,
        variable_name: Optional[str] = None,
        wire_value: Optional[str] = None,
        is_optional: bool = False,
    ) -> AST.Expression:
        form_function_definition = _export(
            "Form",
        )

        kwargs: List[Tuple[str, AST.Expression]] = []
        if is_optional:
            kwargs.append(("default", AST.Expression(AST.TypeHint.none())))
        if variable_name is not None and wire_value is not None and variable_name != wire_value:
            kwargs.append(("alias", AST.Expression(AST.CodeWriter(f'"{wire_value}"'))))

        if len(kwargs) > 0:
            return AST.Expression(
                AST.FunctionInvocation(
                    function_definition=form_function_definition,
                    kwargs=kwargs,
                )
            )
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=form_function_definition,
                args=[AST.Expression(AST.CodeWriter("..."))],
            )
        )

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
    def Query(
        *,
        default: Optional[AST.Expression],
        variable_name: str,
        wire_value: str,
        docs: Optional[str],
    ) -> AST.Expression:
        kwargs: List[Tuple[str, AST.Expression]] = []
        kwargs.append(("default", default if default is not None else AST.Expression("...")))
        if variable_name != wire_value:
            kwargs.append(("alias", AST.Expression(AST.CodeWriter(f'"{wire_value}"'))))
        if docs is not None:
            kwargs.append(
                (
                    "description",
                    AST.Expression(AST.CodeWriter('"' + docs.replace("\n", "\\n").replace("\r", "\\r") + '"')),
                )
            )
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=_export(
                    "Query",
                ),
                kwargs=kwargs,
            )
        )

    @staticmethod
    def UploadFileType(
        *,
        is_optional: bool,
        is_list: bool,
    ) -> AST.TypeHint:
        inner_type = AST.TypeHint(_export("UploadFile"))
        if is_list:
            inner_type = AST.TypeHint.list(inner_type)
            if is_optional:
                inner_type = AST.TypeHint.optional(inner_type)
        elif is_optional:
            # A bit odd that they're not using the Optional typehint, but just mirroring FastAPI docs:
            # https://fastapi.tiangolo.com/tutorial/request-files/#optional-file-upload
            inner_type = AST.TypeHint.union(inner_type, AST.TypeHint.none())

        return inner_type

    @staticmethod
    def UploadFile(
        *,
        is_optional: bool,
        is_list: bool,
        variable_name: str,
        wire_value: str,
        docs: Optional[str],
    ) -> AST.Expression:
        kwargs: List[Tuple[str, AST.Expression]] = []
        if variable_name != wire_value:
            kwargs.append(("alias", AST.Expression(AST.CodeWriter(f'"{wire_value}"'))))
        if docs is not None:
            kwargs.append(
                (
                    "description",
                    AST.Expression(AST.CodeWriter('"' + docs.replace("\n", "\\n").replace("\r", "\\r") + '"')),
                )
            )

        inner_type = FastAPI.UploadFileType(is_optional=is_optional, is_list=is_list)

        # The type hint here should be:
        # UploadFile
        # Annotated[UploadFile, File(description="A file read as UploadFile")]
        # etc.
        return (
            AST.Expression(inner_type)
            if len(kwargs) == 0
            else AST.Expression(
                AST.TypeHint.annotated(
                    inner_type,
                    AST.Expression(
                        AST.FunctionInvocation(
                            function_definition=_export(
                                "File",
                            ),
                            kwargs=kwargs,
                        )
                    ),
                )
            )
        )

    @staticmethod
    def include_router(
        *, app_variable: str, router: AST.Expression, kwargs: List[Tuple[str, AST.Expression]]
    ) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(qualified_name_excluding_import=(app_variable, "include_router")),
                args=[router],
                kwargs=kwargs,
            )
        )

    @staticmethod
    def jsonable_encoder(body: AST.Expression, *, exclude_none: bool = False) -> AST.Expression:
        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=_export("encoders", "jsonable_encoder"),
                args=[body],
                kwargs=[("exclude_none", AST.Expression(str(exclude_none)))] if exclude_none else [],
            )
        )

    EXCEPTION_HANDLER_REQUEST_ARGUMENT = "request"
    EXCEPTION_HANDLER_EXCEPTION_ARGUMENT = "exc"

    @staticmethod
    def exception_handler(
        *,
        exception_handler_name: str,
        app_variable: str,
        exception_type: AST.ClassReference,
        body: AST.CodeWriter,
    ) -> AST.FunctionDeclaration:
        decorator = AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(qualified_name_excluding_import=(app_variable, "exception_handler")),
                args=[AST.Expression(exception_type)],
            )
        )
        return AST.FunctionDeclaration(
            name=exception_handler_name,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(name=FastAPI.EXCEPTION_HANDLER_REQUEST_ARGUMENT, type_hint=FastAPI.Request),
                    AST.FunctionParameter(
                        name=FastAPI.EXCEPTION_HANDLER_EXCEPTION_ARGUMENT, type_hint=AST.TypeHint(type=exception_type)
                    ),
                ],
                return_type=AST.TypeHint(FastAPI.JSONResponse.REFERENCE),
            ),
            decorators=[decorator],
            body=body,
        )

    @staticmethod
    def add_exception_handler(
        *,
        app_variable: str,
        exception_type: AST.ClassReference,
        handler: AST.Reference,
    ) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=(app_variable, "add_exception_handler")),
            args=[AST.Expression(exception_type), AST.Expression(handler)],
        )
