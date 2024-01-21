import enum

from fern_python.codegen import AST

PYDANTIC_DEPENDENCY = AST.Dependency(name="pydantic", version=">= 1.9.2, < 2.5.0")


class PydanticVersionCompatibility(str, enum.Enum):
    V1 = "v1"
    V2 = "v2"
    Both = "both"


def _export(version: PydanticVersionCompatibility, *export: str) -> AST.ClassReference:
    if version == PydanticVersionCompatibility.V1:
        return AST.ClassReference(
            import_=AST.ReferenceImport(
                module=AST.Module.external(
                    dependency=PYDANTIC_DEPENDENCY,
                    module_path=("pydantic",),
                ),
            ),
            qualified_name_excluding_import=export,
        )
    elif version == PydanticVersionCompatibility.V2:
        return AST.ClassReference(
            import_=AST.ReferenceImport(
                module=AST.Module.external(
                    dependency=PYDANTIC_DEPENDENCY,
                    module_path=("pydantic", "v1"),
                ),
                alias="pydantic",
            ),
            qualified_name_excluding_import=export,
        )
    elif version == PydanticVersionCompatibility.Both:
        return AST.ClassReference(
            import_=AST.ReferenceImport(
                module=AST.Module.external(
                    dependency=PYDANTIC_DEPENDENCY,
                    module_path=("pydantic", "v1"),
                ),
                alias="pydantic",
                alternative_import=AST.ReferenceImport(
                    module=AST.Module.external(
                        dependency=PYDANTIC_DEPENDENCY,
                        module_path=("pydantic",),
                    ),
                    mypy_ignore=True,
                ),
                mypy_ignore=True,
            ),
            qualified_name_excluding_import=export,
        )
    else:
        raise AssertionError(f"Encountered unknown pydnatic version compatibility type: {version}")


class Pydantic:
    @staticmethod
    def Field(version: PydanticVersionCompatibility) -> AST.ClassReference:
        return _export(version, "Field")

    @staticmethod
    def BaseModel(version: PydanticVersionCompatibility) -> AST.ClassReference:
        return _export(version, "BaseModel")

    @staticmethod
    def PrivateAttr(version: PydanticVersionCompatibility) -> AST.ClassReference:
        return _export(version, "PrivateAttr")

    class Extra:
        @staticmethod
        def forbid(version: PydanticVersionCompatibility) -> AST.Expression:
            return AST.Expression(_export(version, "Extra", "forbid"))

    @staticmethod
    def root_validator(version: PydanticVersionCompatibility, pre: bool = False) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=_export(version, "root_validator"),
            args=[AST.Expression(expression=f'pre={"True" if pre else "False"}')],
        )

    @staticmethod
    def validator(version: PydanticVersionCompatibility, field_name: str, pre: bool = False) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=_export(version, "validator"),
            args=[AST.Expression(expression=f'"{field_name}", pre={"True" if pre else "False"}')],
        )

    @staticmethod
    def parse_obj_as(
        version: PydanticVersionCompatibility, type_of_obj: AST.TypeHint, obj: AST.Expression
    ) -> AST.Expression:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_node(
                AST.Expression(
                    AST.FunctionInvocation(
                        function_definition=_export(version, "parse_obj_as"),
                        args=[AST.Expression(type_of_obj), obj],
                    )
                )
            )

            # mypy gets confused when passing unions for the Type argument
            # https://github.com/pydantic/pydantic/issues/1847
            writer.write_line("# type: ignore")

        return AST.Expression(AST.CodeWriter(write))
