from __future__ import annotations

import typing

import pydantic
import typing_extensions

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def list(self, value: TypeReference) -> ContainerType:
        return ContainerType(__root__=_ContainerType.List(type="list", list=value))

    def map(self, value: MapType) -> ContainerType:
        return ContainerType(__root__=_ContainerType.Map(**dict(value), type="map"))

    def optional(self, value: TypeReference) -> ContainerType:
        return ContainerType(__root__=_ContainerType.Optional(type="optional", optional=value))

    def set(self, value: TypeReference) -> ContainerType:
        return ContainerType(__root__=_ContainerType.Set(type="set", set=value))


class ContainerType(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get_as_union(
        self,
    ) -> typing.Union[_ContainerType.List, _ContainerType.Map, _ContainerType.Optional, _ContainerType.Set]:
        return self.__root__

    def visit(
        self,
        list: typing.Callable[[TypeReference], T_Result],
        map: typing.Callable[[MapType], T_Result],
        optional: typing.Callable[[TypeReference], T_Result],
        set: typing.Callable[[TypeReference], T_Result],
    ) -> T_Result:
        if self.__root__.type == "list":
            return list(self.__root__.list)
        if self.__root__.type == "map":
            return map(self.__root__)
        if self.__root__.type == "optional":
            return optional(self.__root__.optional)
        if self.__root__.type == "set":
            return set(self.__root__.set)

    __root__: typing_extensions.Annotated[
        typing.Union[_ContainerType.List, _ContainerType.Map, _ContainerType.Optional, _ContainerType.Set],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


from .map_type import MapType  # noqa: E402
from .type_reference import TypeReference  # noqa: E402


class _ContainerType:
    class List(pydantic.BaseModel):
        type: typing_extensions.Literal["list"] = pydantic.Field(alias="_type")
        list: TypeReference

        class Config:
            frozen = True
            allow_population_by_field_name = True

    class Map(MapType):
        type: typing_extensions.Literal["map"] = pydantic.Field(alias="_type")

        class Config:
            frozen = True
            allow_population_by_field_name = True

    class Optional(pydantic.BaseModel):
        type: typing_extensions.Literal["optional"] = pydantic.Field(alias="_type")
        optional: TypeReference

        class Config:
            frozen = True
            allow_population_by_field_name = True

    class Set(pydantic.BaseModel):
        type: typing_extensions.Literal["set"] = pydantic.Field(alias="_type")
        set: TypeReference

        class Config:
            frozen = True
            allow_population_by_field_name = True


ContainerType.update_forward_refs()
