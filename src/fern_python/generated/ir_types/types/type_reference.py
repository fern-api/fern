from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .declared_type_name import DeclaredTypeName
from .primitive_type import PrimitiveType

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def container(self, value: ContainerType) -> TypeReference:
        return TypeReference(__root__=_TypeReference.Container(type="container", container=value))

    def named(self, value: DeclaredTypeName) -> TypeReference:
        return TypeReference(__root__=_TypeReference.Named(**dict(value), type="named"))

    def primitive(self, value: PrimitiveType) -> TypeReference:
        return TypeReference(__root__=_TypeReference.Primitive(type="primitive", primitive=value))

    def unknown(self) -> TypeReference:
        return TypeReference(__root__=_TypeReference.Unknown(type="unknown"))

    def void(self) -> TypeReference:
        return TypeReference(__root__=_TypeReference.Void(type="void"))


class TypeReference(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[
        _TypeReference.Container,
        _TypeReference.Named,
        _TypeReference.Primitive,
        _TypeReference.Unknown,
        _TypeReference.Void,
    ]:
        return self.__root__

    def visit(
        self,
        container: typing.Callable[[ContainerType], T_Result],
        named: typing.Callable[[DeclaredTypeName], T_Result],
        primitive: typing.Callable[[PrimitiveType], T_Result],
        unknown: typing.Callable[[], T_Result],
        void: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.__root__.type == "container":
            return container(self.__root__.container)
        if self.__root__.type == "named":
            return named(self.__root__)
        if self.__root__.type == "primitive":
            return primitive(self.__root__.primitive)
        if self.__root__.type == "unknown":
            return unknown()
        if self.__root__.type == "void":
            return void()

    __root__: typing_extensions.Annotated[
        typing.Union[
            _TypeReference.Container,
            _TypeReference.Named,
            _TypeReference.Primitive,
            _TypeReference.Unknown,
            _TypeReference.Void,
        ],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


from .container_type import ContainerType  # noqa: E402


class _TypeReference:
    class Container(pydantic.BaseModel):
        type: typing_extensions.Literal["container"] = pydantic.Field(alias="_type")
        container: ContainerType

        class Config:
            allow_population_by_field_name = True

    class Named(DeclaredTypeName):
        type: typing_extensions.Literal["named"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class Primitive(pydantic.BaseModel):
        type: typing_extensions.Literal["primitive"] = pydantic.Field(alias="_type")
        primitive: PrimitiveType

        class Config:
            allow_population_by_field_name = True

    class Unknown(pydantic.BaseModel):
        type: typing_extensions.Literal["unknown"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class Void(pydantic.BaseModel):
        type: typing_extensions.Literal["void"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True


TypeReference.update_forward_refs()
