from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .container_type import ContainerType
from .primitive_type import PrimitiveType
from .resolved_named_type import ResolvedNamedType

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def container(self, value: ContainerType) -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Container(type="container", container=value))

    def named(self, value: ResolvedNamedType) -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Named(**dict(value), type="named"))

    def primitive(self, value: PrimitiveType) -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Primitive(type="primitive", primitive=value))

    def unknown(self) -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Unknown(type="unknown"))

    def void(self) -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Void(type="void"))


class ResolvedTypeReference(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[
        _ResolvedTypeReference.Container,
        _ResolvedTypeReference.Named,
        _ResolvedTypeReference.Primitive,
        _ResolvedTypeReference.Unknown,
        _ResolvedTypeReference.Void,
    ]:
        return self.__root__

    def visit(
        self,
        container: typing.Callable[[ContainerType], T_Result],
        named: typing.Callable[[ResolvedNamedType], T_Result],
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
            _ResolvedTypeReference.Container,
            _ResolvedTypeReference.Named,
            _ResolvedTypeReference.Primitive,
            _ResolvedTypeReference.Unknown,
            _ResolvedTypeReference.Void,
        ],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _ResolvedTypeReference:
    class Container(pydantic.BaseModel):
        type: typing_extensions.Literal["container"] = pydantic.Field(alias="_type")
        container: ContainerType

        class Config:
            allow_population_by_field_name = True

    class Named(ResolvedNamedType):
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


ResolvedTypeReference.update_forward_refs()
