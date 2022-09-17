from __future__ import annotations

import typing

import pydantic
import typing_extensions

_Result = typing.TypeVar("_Result")


class ContainerType(pydantic.BaseModel):

    __root__: typing_extensions.Annotated[
        typing.Union[_ContainerType.List, _ContainerType.Map, _ContainerType.Optional, _ContainerType.Set],
        pydantic.Field(discriminator="type"),
    ]

    @staticmethod
    def list(value: TypeReference) -> ContainerType:
        return ContainerType(__root__=_ContainerType.List(type="list", list=value))

    @staticmethod
    def map(value: MapType) -> ContainerType:
        return ContainerType(
            __root__=_ContainerType.Map(type="map", key_type=value.key_type, value_type=value.value_type)
        )

    @staticmethod
    def optional(value: TypeReference) -> ContainerType:
        return ContainerType(__root__=_ContainerType.Optional(type="optional", optional=value))

    @staticmethod
    def set(value: TypeReference) -> ContainerType:
        return ContainerType(__root__=_ContainerType.Set(type="set", set=value))

    def _visit(
        self,
        list: typing.Callable[[TypeReference], _Result],
        map: typing.Callable[[MapType], _Result],
        optional: typing.Callable[[TypeReference], _Result],
        set: typing.Callable[[TypeReference], _Result],
    ) -> _Result:
        if self.__root__.type == "list":
            return list(self.__root__.list)
        if self.__root__.type == "map":
            return map(self.__root__)
        if self.__root__.type == "optional":
            return optional(self.__root__.optional)
        if self.__root__.type == "set":
            return set(self.__root__.set)


# why is this not at the top? because MapType depends on ContainerType
# why is this not at the bottom?
#   1. Because this is effectively the bottom, _ContainerType is never imported
#   2. Because _ContainerType subclasses MapType, so it can't be below _ContainerType
# When writing ContainerType, we should know that MapType will eventually try
# import ContainerType, so this import should go after we define ContainerType.
# Beyond that, we don't care where it goes.
from .map_type import MapType  # noqa: E402

# why is this not at the top? Because TypeReference depends on ContainerType
# why is this not at the bottom? Because this is effectively the bottom, _ContainerType is never imported
# When writing ContainerType, we should know that TypeReference will eventually try
# import ContainerType, so this import should go after we define ContainerType.
# Beyond that, we don't care where it goes.
from .type_reference import TypeReference  # noqa: E402


class _ContainerType:
    class List(pydantic.BaseModel):
        type: typing.Literal["list"] = pydantic.Field(alias="_type")
        list: TypeReference

        class Config:
            allow_population_by_field_name = True

    class Map(MapType):
        type: typing.Literal["map"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class Optional(pydantic.BaseModel):
        type: typing.Literal["optional"] = pydantic.Field(alias="_type")
        optional: TypeReference

        class Config:
            allow_population_by_field_name = True

    class Set(pydantic.BaseModel):
        type: typing.Literal["set"] = pydantic.Field(alias="_type")
        set: TypeReference

        class Config:
            allow_population_by_field_name = True


# this needs to be after _ContainerType because Container relies on _ContainerType
ContainerType.update_forward_refs()
# these need to be after _ContainerType because they are literally calling methods on _ContainerType
_ContainerType.List.update_forward_refs()
_ContainerType.Map.update_forward_refs()
_ContainerType.Optional.update_forward_refs()
_ContainerType.Set.update_forward_refs()
