from __future__ import annotations

import typing
from abc import ABC, abstractmethod
from typing import Literal, Union

from pydantic import BaseModel, Field
from typing_extensions import Annotated

from .. import services
from ..commons import WithDocs

_Result = typing.TypeVar("_Result")


class _AuthScheme:
    class Bearer(WithDocs):
        type: Literal["bearer"]

    class Basic(WithDocs):
        type: Literal["basic"]

    class Header(services.HttpHeader):
        type: Literal["header"]


class AuthScheme(BaseModel):

    __root__: Annotated[
        Union[_AuthScheme.Bearer, _AuthScheme.Basic, _AuthScheme.Header],
        Field(discriminator="type"),
    ]

    @staticmethod
    def bearer(value: WithDocs) -> AuthScheme:
        return AuthScheme(__root__=_AuthScheme.Bearer(type="bearer", docs=value.docs))

    @staticmethod
    def basic(value: WithDocs) -> AuthScheme:
        return AuthScheme(__root__=_AuthScheme.Basic(type="basic", docs=value.docs))

    @staticmethod
    def header(value: services.HttpHeader) -> AuthScheme:
        return AuthScheme(
            __root__=_AuthScheme.Header(type="header", docs=value.docs, name=value.name, value_type=value.value_type)
        )

    class _Visitor(ABC, typing.Generic[_Result]):
        @abstractmethod
        def bearer(self, value: WithDocs) -> _Result:
            ...

        @abstractmethod
        def basic(self, value: WithDocs) -> _Result:
            ...

        @abstractmethod
        def header(self, value: services.HttpHeader) -> _Result:
            ...

    def _visit(self, visitor: _Visitor[_Result]) -> _Result:
        if self.__root__.type == "bearer":
            return visitor.bearer(self.__root__)
        if self.__root__.type == "basic":
            return visitor.basic(self.__root__)
        if self.__root__.type == "header":
            return visitor.header(self.__root__)
