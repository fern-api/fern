import typing

import pydantic
import typing_extensions

from .resolved_type_reference import ResolvedTypeReference
from .type_reference import TypeReference


class AliasTypeDeclaration(pydantic.BaseModel):
    alias_of: TypeReference = pydantic.Field(alias="aliasOf")
    resolved_type: ResolvedTypeReference = pydantic.Field(alias="resolvedType")

    @pydantic.validator("alias_of")
    def _validate_alias_of(cls, alias_of: TypeReference) -> TypeReference:
        for validator in AliasTypeDeclaration.Validators._alias_of:
            alias_of = validator(alias_of)
        return alias_of

    @pydantic.validator("resolved_type")
    def _validate_resolved_type(cls, resolved_type: ResolvedTypeReference) -> ResolvedTypeReference:
        for validator in AliasTypeDeclaration.Validators._resolved_type:
            resolved_type = validator(resolved_type)
        return resolved_type

    class Validators:
        _alias_of: typing.ClassVar[typing.List[typing.Callable[[TypeReference], TypeReference]]] = []
        _resolved_type: typing.ClassVar[
            typing.List[typing.Callable[[ResolvedTypeReference], ResolvedTypeReference]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["alias_of"]
        ) -> typing.Callable[
            [typing.Callable[[TypeReference], TypeReference]], typing.Callable[[TypeReference], TypeReference]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["resolved_type"]
        ) -> typing.Callable[
            [typing.Callable[[ResolvedTypeReference], ResolvedTypeReference]],
            typing.Callable[[ResolvedTypeReference], ResolvedTypeReference],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "alias_of":
                    cls._alias_of.append(validator)
                elif field_name == "resolved_type":
                    cls._resolved_type.append(validator)
                else:
                    raise RuntimeError("Field does not exist on AliasTypeDeclaration: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
