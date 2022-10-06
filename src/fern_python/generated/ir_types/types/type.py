from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .alias_type_declaration import AliasTypeDeclaration
from .enum_type_declaration import EnumTypeDeclaration
from .object_type_declaration import ObjectTypeDeclaration
from .union_type_declaration import UnionTypeDeclaration

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def alias(self, value: AliasTypeDeclaration) -> Type:
        return Type(__root__=_Type.Alias(**dict(value), type="alias"))

    def enum(self, value: EnumTypeDeclaration) -> Type:
        return Type(__root__=_Type.Enum(**dict(value), type="enum"))

    def object(self, value: ObjectTypeDeclaration) -> Type:
        return Type(__root__=_Type.Object(**dict(value), type="object"))

    def union(self, value: UnionTypeDeclaration) -> Type:
        return Type(__root__=_Type.Union(**dict(value), type="union"))


class Type(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get_as_union(self) -> typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union]:
        return self.__root__

    def visit(
        self,
        alias: typing.Callable[[AliasTypeDeclaration], T_Result],
        enum: typing.Callable[[EnumTypeDeclaration], T_Result],
        object: typing.Callable[[ObjectTypeDeclaration], T_Result],
        union: typing.Callable[[UnionTypeDeclaration], T_Result],
    ) -> T_Result:
        if self.__root__.type == "alias":
            return alias(self.__root__)
        if self.__root__.type == "enum":
            return enum(self.__root__)
        if self.__root__.type == "object":
            return object(self.__root__)
        if self.__root__.type == "union":
            return union(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union], pydantic.Field(discriminator="type")
    ]

    @pydantic.root_validator
    def _validate(cls, values: typing.Dict[str, typing.Any]) -> typing.Dict[str, typing.Any]:
        value = typing.cast(typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union], values.get("__root__"))
        for validator in Type.Validators._validators:
            value = validator(value)
        return {**values, "__root__": value}

    class Validators:
        _validators: typing.ClassVar[
            typing.List[
                typing.Callable[
                    [typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union]],
                    typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union],
                ]
            ]
        ] = []

        @classmethod
        def add_validator(
            cls,
            validator: typing.Callable[
                [typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union]],
                typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union],
            ],
        ) -> None:
            cls._validators.append(validator)

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


class _Type:
    class Alias(AliasTypeDeclaration):
        type: typing_extensions.Literal["alias"] = pydantic.Field(alias="_type")

        class Config:
            frozen = True
            allow_population_by_field_name = True

    class Enum(EnumTypeDeclaration):
        type: typing_extensions.Literal["enum"] = pydantic.Field(alias="_type")

        class Config:
            frozen = True
            allow_population_by_field_name = True

    class Object(ObjectTypeDeclaration):
        type: typing_extensions.Literal["object"] = pydantic.Field(alias="_type")

        class Config:
            frozen = True
            allow_population_by_field_name = True

    class Union(UnionTypeDeclaration):
        type: typing_extensions.Literal["union"] = pydantic.Field(alias="_type")

        class Config:
            frozen = True
            allow_population_by_field_name = True


Type.update_forward_refs()
