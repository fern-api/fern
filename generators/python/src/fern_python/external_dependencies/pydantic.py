import enum

from fern_python.codegen import AST

PYDANTIC_CORE_DEPENDENCY = AST.Dependency(name="pydantic-core", version=">=2.18.2")
PYDANTIC_DEPENDENCY = AST.Dependency(name="pydantic", version=">=1.9.2")
PYDANTIC_V1_DEPENDENCY = AST.Dependency(name="pydantic", version=">=1.9.2,<=1.10.14")
PYDANTIC_V2_DEPENDENCY = AST.Dependency(name="pydantic", version=">=2.0.0")


class PydanticVersionCompatibility(str, enum.Enum):
    V1 = "v1"
    V2 = "v2"
    Both = "both"
    V1_ON_V2 = "v1_on_v2"


def _get_module_path(version_compatibility: PydanticVersionCompatibility) -> tuple[str, ...]:
    if version_compatibility == PydanticVersionCompatibility.V1_ON_V2:
        return ("pydantic", "v1")
    return ("pydantic",)


def _get_dependency(version_compatibility: PydanticVersionCompatibility) -> AST.Dependency:
    if version_compatibility == PydanticVersionCompatibility.V1:
        return PYDANTIC_V1_DEPENDENCY
    elif version_compatibility == PydanticVersionCompatibility.V2:
        return PYDANTIC_V2_DEPENDENCY
    elif version_compatibility == PydanticVersionCompatibility.V1_ON_V2:
        return PYDANTIC_V2_DEPENDENCY
    else:  # Both
        return PYDANTIC_DEPENDENCY


def _export(version_compatibility: PydanticVersionCompatibility, *export: str) -> AST.ClassReference:
    return AST.ClassReference(
        import_=AST.ReferenceImport(
            module=AST.Module.external(
                dependency=_get_dependency(version_compatibility),
                module_path=_get_module_path(version_compatibility),
            ),
        ),
        qualified_name_excluding_import=export,
    )


class Pydantic:
    class Extra:
        def __init__(self, version_compatibility: PydanticVersionCompatibility):
            self.version_compatibility = version_compatibility

        def forbid(self) -> AST.Expression:
            return AST.Expression(_export(self.version_compatibility, "Extra", "forbid"))

        def allow(self) -> AST.Expression:
            return AST.Expression(_export(self.version_compatibility, "Extra", "allow"))

        def ignore(self) -> AST.Expression:
            return AST.Expression(_export(self.version_compatibility, "Extra", "ignore"))

    def __init__(self, version_compatibility: PydanticVersionCompatibility):
        self.version_compatibility = version_compatibility

    def Field(self) -> AST.ClassReference:
        return _export(self.version_compatibility, "Field")

    def BaseModel(self) -> AST.ClassReference:
        return _export(self.version_compatibility, "BaseModel")

    def ConfigDict(self) -> AST.ClassReference:
        return _export(self.version_compatibility, "ConfigDict")

    def PrivateAttr(self) -> AST.ClassReference:
        return _export(self.version_compatibility, "PrivateAttr")

    def RootModel(self) -> AST.ClassReference:
        return _export(self.version_compatibility, "RootModel")

    def validator(self, pre: bool = False) -> AST.Expression:
        if self.version_compatibility == PydanticVersionCompatibility.V2:
            return AST.Expression(f'validator("*", pre={str(pre).lower()})')
        # V1 and V1_ON_V2 use root_validator
        return AST.Expression(f"root_validator(pre={str(pre).lower()})")

    def model_validate_method(self) -> str:
        if self.version_compatibility == PydanticVersionCompatibility.V2:
            return "model_validate"
        # V1 and V1_ON_V2 use parse_obj
        return "parse_obj"

    @property
    def extra(self) -> "Pydantic.Extra":
        return Pydantic.Extra(self.version_compatibility)
