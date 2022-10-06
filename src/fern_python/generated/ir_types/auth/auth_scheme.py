from __future__ import annotations

import typing

import pydantic
import typing_extensions

from ..commons.with_docs import WithDocs
from ..services.http.http_header import HttpHeader

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def bearer(self, value: WithDocs) -> AuthScheme:
        return AuthScheme(__root__=_AuthScheme.Bearer(**dict(value), type="bearer"))

    def basic(self, value: WithDocs) -> AuthScheme:
        return AuthScheme(__root__=_AuthScheme.Basic(**dict(value), type="basic"))

    def header(self, value: HttpHeader) -> AuthScheme:
        return AuthScheme(__root__=_AuthScheme.Header(**dict(value), type="header"))


class AuthScheme(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get_as_union(self) -> typing.Union[_AuthScheme.Bearer, _AuthScheme.Basic, _AuthScheme.Header]:
        return self.__root__

    def visit(
        self,
        bearer: typing.Callable[[WithDocs], T_Result],
        basic: typing.Callable[[WithDocs], T_Result],
        header: typing.Callable[[HttpHeader], T_Result],
    ) -> T_Result:
        if self.__root__.type == "bearer":
            return bearer(self.__root__)
        if self.__root__.type == "basic":
            return basic(self.__root__)
        if self.__root__.type == "header":
            return header(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_AuthScheme.Bearer, _AuthScheme.Basic, _AuthScheme.Header], pydantic.Field(discriminator="type")
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


class _AuthScheme:
    class Bearer(WithDocs):
        type: typing_extensions.Literal["bearer"] = pydantic.Field(alias="_type")

        class Config:
            frozen = True
            allow_population_by_field_name = True

    class Basic(WithDocs):
        type: typing_extensions.Literal["basic"] = pydantic.Field(alias="_type")

        class Config:
            frozen = True
            allow_population_by_field_name = True

    class Header(HttpHeader):
        type: typing_extensions.Literal["header"] = pydantic.Field(alias="_type")

        class Config:
            frozen = True
            allow_population_by_field_name = True


AuthScheme.update_forward_refs()
