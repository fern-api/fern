from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .alias_type_declaration import AliasTypeDeclaration
from .enum_type_declaration import EnumTypeDeclaration
from .object_type_declaration import ObjectTypeDeclaration
from .union_type_declaration import UnionTypeDeclaration

_Result = typing.TypeVar("_Result")


class _Type:
    class Alias(AliasTypeDeclaration):
        type: typing.Literal["alias"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class Enum(EnumTypeDeclaration):
        type: typing.Literal["enum"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class Object(ObjectTypeDeclaration):
        type: typing.Literal["object"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class Union(UnionTypeDeclaration):
        type: typing.Literal["union"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True


class Type(pydantic.BaseModel):
    _value: typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union] = pydantic.PrivateAttr()

    def __init__(
        self,
        **data: typing.Any,
    ):
        super().__init__(**data)
        self._value = data["__root__"]

    @staticmethod
    def alias(value: AliasTypeDeclaration) -> Type:
        return Type(
            __root__=_Type.Alias(type="alias", alias_of=value.alias_of, resolved_type=value.resolved_type),
        )

    @staticmethod
    def enum(value: EnumTypeDeclaration) -> Type:
        return Type(
            __root__=_Type.Enum(type="enum", values=value.values),
        )

    @staticmethod
    def object(value: ObjectTypeDeclaration) -> Type:
        return Type(
            __root__=_Type.Object(type="object", extends=value.extends, properties=value.properties),
        )

    @staticmethod
    def union(value: UnionTypeDeclaration) -> Type:
        return Type(
            __root__=_Type.Union(
                type="union",
                discriminant=value.discriminant,
                discriminant_v2=value.discriminant_v2,
                types=value.types,
            ),
        )

    __root__: typing_extensions.Annotated[
        typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union],
        pydantic.Field(discriminator="type"),
    ]

    def _visit(
        self,
        alias: typing.Callable[[AliasTypeDeclaration], _Result],
        enum: typing.Callable[[EnumTypeDeclaration], _Result],
        object: typing.Callable[[ObjectTypeDeclaration], _Result],
        union: typing.Callable[[UnionTypeDeclaration], _Result],
    ) -> _Result:
        if self.__root__.type == "alias":
            return alias(self.__root__)
        if self.__root__.type == "enum":
            return enum(self.__root__)
        if self.__root__.type == "object":
            return object(self.__root__)
        if self.__root__.type == "union":
            return union(self.__root__)
