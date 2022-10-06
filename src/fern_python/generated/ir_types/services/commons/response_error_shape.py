from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .single_response_error_property import SingleResponseErrorProperty

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def single_property(self, value: SingleResponseErrorProperty) -> ResponseErrorShape:
        return ResponseErrorShape(__root__=_ResponseErrorShape.SingleProperty(**dict(value), type="singleProperty"))

    def no_properties(self) -> ResponseErrorShape:
        return ResponseErrorShape(__root__=_ResponseErrorShape.NoProperties(type="noProperties"))


class ResponseErrorShape(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get_as_union(self) -> typing.Union[_ResponseErrorShape.SingleProperty, _ResponseErrorShape.NoProperties]:
        return self.__root__

    def visit(
        self,
        single_property: typing.Callable[[SingleResponseErrorProperty], T_Result],
        no_properties: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.__root__.type == "singleProperty":
            return single_property(self.__root__)
        if self.__root__.type == "noProperties":
            return no_properties()

    __root__: typing_extensions.Annotated[
        typing.Union[_ResponseErrorShape.SingleProperty, _ResponseErrorShape.NoProperties],
        pydantic.Field(discriminator="type"),
    ]

    @pydantic.root_validator
    def _validate(cls, values: typing.Dict[str, typing.Any]) -> typing.Dict[str, typing.Any]:
        value = typing.cast(
            typing.Union[_ResponseErrorShape.SingleProperty, _ResponseErrorShape.NoProperties], values.get("__root__")
        )
        for validator in ResponseErrorShape.Validators._validators:
            value = validator(value)
        return {**values, "__root__": value}

    class Validators:
        _validators: typing.ClassVar[
            typing.List[
                typing.Callable[
                    [typing.Union[_ResponseErrorShape.SingleProperty, _ResponseErrorShape.NoProperties]],
                    typing.Union[_ResponseErrorShape.SingleProperty, _ResponseErrorShape.NoProperties],
                ]
            ]
        ] = []

        @classmethod
        def add_validator(
            cls,
            validator: typing.Callable[
                [typing.Union[_ResponseErrorShape.SingleProperty, _ResponseErrorShape.NoProperties]],
                typing.Union[_ResponseErrorShape.SingleProperty, _ResponseErrorShape.NoProperties],
            ],
        ) -> None:
            cls._validators.append(validator)

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


class _ResponseErrorShape:
    class SingleProperty(SingleResponseErrorProperty):
        type: typing_extensions.Literal["singleProperty"]

        class Config:
            frozen = True

    class NoProperties(pydantic.BaseModel):
        type: typing_extensions.Literal["noProperties"]

        class Config:
            frozen = True


ResponseErrorShape.update_forward_refs()
