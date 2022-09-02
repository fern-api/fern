from __future__ import annotations
import pydantic
import typing
from abc import ABC, abstractmethod
import typing_extensions
from .declared_type_name import DeclaredTypeName
from .primitive_type import PrimitiveType


_Result = typing.TypeVar("_Result")


class _TypeReference:
    class Container(pydantic.BaseModel):
        type: typing.Literal["container"]
        container: ContainerType

    class Named(DeclaredTypeName):
        type: typing.Literal["named"]

    class Primitive(pydantic.BaseModel):
        type: typing.Literal["primitive"]
        primitive: PrimitiveType

    class Unknown(pydantic.BaseModel):
        type: typing.Literal["unknown"]

    class Void(pydantic.BaseModel):
        type: typing.Literal["void"]


class TypeReference(pydantic.BaseModel):
    @staticmethod
    def container(value: ContainerType) -> TypeReference:
        return TypeReference(__root__=_TypeReference.Container(type="container", container=value))

    @staticmethod
    def named(value: DeclaredTypeName) -> TypeReference:
        return TypeReference(
            __root__=_TypeReference.Named(type="named", fern_filepath=value.fern_filepath, name=value.name)
        )

    @staticmethod
    def primitive(value: PrimitiveType) -> TypeReference:
        return TypeReference(__root__=_TypeReference.Primitive(type="primitive", primitive=value))

    @staticmethod
    def unknown() -> TypeReference:
        return TypeReference(__root__=_TypeReference.Unknown(type="unknown"))

    @staticmethod
    def void() -> TypeReference:
        return TypeReference(__root__=_TypeReference.Void(type="void"))

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

    class _Visitor(ABC, typing.Generic[_Result]):
        @abstractmethod
        def container(self, value: ContainerType) -> _Result:
            ...

        @abstractmethod
        def named(self, value: DeclaredTypeName) -> _Result:
            ...

        @abstractmethod
        def primitive(self, value: PrimitiveType) -> _Result:
            ...

        @abstractmethod
        def unknown(self) -> _Result:
            ...

        @abstractmethod
        def void(self) -> _Result:
            ...

    def _visit(self, visitor: _Visitor[_Result]) -> _Result:
        if self.__root__.type == "container":
            return visitor.container(self.__root__.container)
        if self.__root__.type == "named":
            return visitor.named(self.__root__)
        if self.__root__.type == "primitive":
            return visitor.primitive(self.__root__.primitive)
        if self.__root__.type == "unknown":
            return visitor.unknown()
        if self.__root__.type == "void":
            return visitor.void()


from .container_type import ContainerType  # noqa E402

_TypeReference.Container.update_forward_refs()
