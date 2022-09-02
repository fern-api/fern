from __future__ import annotations
import pydantic
import typing
from abc import ABC, abstractmethod
import typing_extensions
from .alias_type_declaration import AliasTypeDeclaration
from .enum_type_declaration import EnumTypeDeclaration
from .object_type_declaration import ObjectTypeDeclaration
from .union_type_declaration import UnionTypeDeclaration

_Result = typing.TypeVar("_Result")


class _Type:
    class Alias(AliasTypeDeclaration):
        type: typing.Literal["alias"]

    class Enum(EnumTypeDeclaration):
        type: typing.Literal["enum"]

    class Object(ObjectTypeDeclaration):
        type: typing.Literal["object"]

    class Union(UnionTypeDeclaration):
        type: typing.Literal["union"]


class Type(pydantic.BaseModel):
    @staticmethod
    def alias(value: AliasTypeDeclaration) -> Type:
        return Type(__root__=_Type.Alias(type="alias", alias_of=value.alias_of))

    @staticmethod
    def enum(value: EnumTypeDeclaration) -> Type:
        return Type(__root__=_Type.Enum(type="enum", values=value.values))

    @staticmethod
    def object(value: ObjectTypeDeclaration) -> Type:
        return Type(__root__=_Type.Object(type="object", extends=value.extends, properties=value.properties))

    @staticmethod
    def union(value: UnionTypeDeclaration) -> Type:
        return Type(__root__=_Type.Union(type="union", discriminant=value.discriminant, types=value.types))

    __root__: typing_extensions.Annotated[
        typing.Union[_Type.Alias, _Type.Enum, _Type.Object, _Type.Union],
        pydantic.Field(discriminator="type"),
    ]

    class _Visitor(ABC, typing.Generic[_Result]):
        @abstractmethod
        def alias(self, value: AliasTypeDeclaration) -> _Result:
            ...

        @abstractmethod
        def enum(self, value: EnumTypeDeclaration) -> _Result:
            ...

        @abstractmethod
        def object(self, value: ObjectTypeDeclaration) -> _Result:
            ...

        @abstractmethod
        def union(self, value: UnionTypeDeclaration) -> _Result:
            ...

    def _visit(self, visitor: _Visitor[_Result]) -> _Result:
        if self.__root__.type == "alias":
            return visitor.alias(self.__root__)
        if self.__root__.type == "enum":
            return visitor.enum(self.__root__)
        if self.__root__.type == "object":
            return visitor.object(self.__root__)
        if self.__root__.type == "union":
            return visitor.union(self.__root__)
