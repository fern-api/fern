from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .declared_type_name import DeclaredTypeName
from .single_union_type_property import SingleUnionTypeProperty

_Result = typing.TypeVar("_Result")


class SingleUnionTypeProperties(pydantic.BaseModel):
    @staticmethod
    def same_properties_as_object(value: DeclaredTypeName) -> SingleUnionTypeProperties:
        return SingleUnionTypeProperties(
            __root__=_SingleUnionTypeProperties.SamePropertiesAsObject(
                properties_type="samePropertiesAsObject", fern_filepath=value.fern_filepath, name=value.name
            )
        )

    @staticmethod
    def single_property(value: SingleUnionTypeProperty) -> SingleUnionTypeProperties:
        return SingleUnionTypeProperties(
            __root__=_SingleUnionTypeProperties.SingleProperty(
                properties_type="singleProperty", name=value.name, type=value.type
            )
        )

    @staticmethod
    def no_properties() -> SingleUnionTypeProperties:
        return SingleUnionTypeProperties(
            __root__=_SingleUnionTypeProperties.NoProperties(properties_type="noProperties")
        )

    def get(
        self,
    ) -> typing.Union[
        _SingleUnionTypeProperties.SamePropertiesAsObject,
        _SingleUnionTypeProperties.SingleProperty,
        _SingleUnionTypeProperties.NoProperties,
    ]:
        return self.__root__

    __root__: typing_extensions.Annotated[
        typing.Union[
            _SingleUnionTypeProperties.SamePropertiesAsObject,
            _SingleUnionTypeProperties.SingleProperty,
            _SingleUnionTypeProperties.NoProperties,
        ],
        pydantic.Field(discriminator="type"),
    ]

    def _visit(
        self,
        same_properties_as_object: typing.Callable[[DeclaredTypeName], _Result],
        single_property: typing.Callable[[SingleUnionTypeProperty], _Result],
        no_properties: typing.Callable[[], _Result],
    ) -> _Result:
        if self.__root__.properties_type == "samePropertiesAsObject":
            return same_properties_as_object(self.__root__)
        if self.__root__.properties_type == "singleProperty":
            return single_property(self.__root__)
        if self.__root__.properties_type == "noProperties":
            return no_properties()


class _SingleUnionTypeProperties:
    class SamePropertiesAsObject(DeclaredTypeName):
        properties_type: typing.Literal["samePropertiesAsObject"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class SingleProperty(SingleUnionTypeProperty):
        properties_type: typing.Literal["singleProperty"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True

    class NoProperties(pydantic.BaseModel):
        properties_type: typing.Literal["noProperties"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True


SingleUnionTypeProperties.update_forward_refs()
