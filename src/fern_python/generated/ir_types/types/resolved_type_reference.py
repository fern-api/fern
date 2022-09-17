from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .primitive_type import PrimitiveType
from .resolved_named_type import ResolvedNamedType

_Result = typing.TypeVar("_Result")


class ResolvedTypeReference(pydantic.BaseModel):
    @staticmethod
    def container(value: ContainerType) -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Container(type="container", container=value))

    @staticmethod
    def named(value: ResolvedNamedType) -> ResolvedTypeReference:
        return ResolvedTypeReference(
            __root__=_ResolvedTypeReference.Named(type="named", name=value.name, shape=value.shape)
        )

    @staticmethod
    def primitive(value: PrimitiveType) -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Primitive(type="primitive", primitive=value))

    @staticmethod
    def unknown() -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Unknown(type="unknown"))

    @staticmethod
    def void() -> ResolvedTypeReference:
        return ResolvedTypeReference(__root__=_ResolvedTypeReference.Void(type="void"))

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

    def _visit(
        self,
        container: typing.Callable[[ContainerType], _Result],
        named: typing.Callable[[ResolvedNamedType], _Result],
        primitive: typing.Callable[[PrimitiveType], _Result],
        unknown: typing.Callable[[], _Result],
        void: typing.Callable[[], _Result],
    ) -> _Result:
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


class _ResolvedTypeReference:
    class Container(pydantic.BaseModel):
        type: typing.Literal["container"] = pydantic.Field(alias="_type")
        container: ContainerType

        class Config:
            allow_population_by_field_name = True

    class Named(ResolvedNamedType):
        type: typing.Literal["named"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class Primitive(pydantic.BaseModel):
        type: typing.Literal["primitive"] = pydantic.Field(alias="_type")
        primitive: PrimitiveType

        class Config:
            allow_population_by_field_name = True

    class Unknown(pydantic.BaseModel):
        type: typing.Literal["unknown"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class Void(pydantic.BaseModel):
        type: typing.Literal["void"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True


from .container_type import ContainerType  # noqa: E402

ResolvedTypeReference.update_forward_refs()
_ResolvedTypeReference.Container.update_forward_refs()
