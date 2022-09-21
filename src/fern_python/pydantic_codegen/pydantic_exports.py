from fern_python.codegen import AST


def get_reference_to_pydantic_export(export: str) -> AST.ClassReference:
    return AST.ClassReference(
        import_=AST.ReferenceImport(
            module=AST.Module.external(
                dependency=AST.Dependency(name="pydantic", version="^1.9.2"),
                module_path=("pydantic",),
            )
        ),
        qualified_name_excluding_import=(export,),
    )


PYDANTIC_BASE_MODEL_REFERENCE = get_reference_to_pydantic_export("BaseModel")
PYDANTIC_FIELD_REFERENCE = get_reference_to_pydantic_export("Field")
PYDANTIC_PRIVATE_ATTR_REFERENCE = get_reference_to_pydantic_export("PrivateAttr")
