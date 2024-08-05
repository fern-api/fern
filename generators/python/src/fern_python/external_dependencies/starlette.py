from fern_python.codegen import AST

STARLETTE_MODULE = AST.Module.external(
    module_path=("starlette",),
    dependency=AST.Dependency(
        name="starlette",
        version="^0.37.2",
    ),
)

STARLETTE_EXCEPTIONS_MODULE = AST.Module.external(
    module_path=("starlette", "exceptions"),
    dependency=AST.Dependency(
        name="starlette",
        version="^0.37.2",
    ),
)


def _export(*name: str) -> AST.ClassReference:
    return AST.ClassReference(
        qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=STARLETTE_MODULE)
    )


def _export_exception(*name: str) -> AST.ClassReference:
    return AST.ClassReference(
        qualified_name_excluding_import=name, import_=AST.ReferenceImport(module=STARLETTE_EXCEPTIONS_MODULE)
    )


class Starlette:
    HTTPException = _export_exception("HTTPException")

    HTTPException_STATUS_CODE_MEMBER = "status_code"
    HTTPException_DETAIL_MEMBER = "detail"

    HTTP_204_NO_CONTENT = _export("status", "HTTP_204_NO_CONTENT")
