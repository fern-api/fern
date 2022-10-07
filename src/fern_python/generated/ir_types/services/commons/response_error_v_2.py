import typing

import pydantic
import typing_extensions

from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
from ...commons.with_docs import WithDocs
from .response_error_shape import ResponseErrorShape


class ResponseErrorV2(WithDocs):
    discriminant_value: WireStringWithAllCasings = pydantic.Field(alias="discriminantValue")
    shape: ResponseErrorShape

    @pydantic.validator("discriminant_value")
    def _validate_discriminant_value(cls, discriminant_value: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in ResponseErrorV2.Validators._discriminant_value:
            discriminant_value = validator(discriminant_value)
        return discriminant_value

    @pydantic.validator("shape")
    def _validate_shape(cls, shape: ResponseErrorShape) -> ResponseErrorShape:
        for validator in ResponseErrorV2.Validators._shape:
            shape = validator(shape)
        return shape

    class Validators:
        _discriminant_value: typing.ClassVar[
            typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]
        ] = []
        _shape: typing.ClassVar[typing.List[typing.Callable[[ResponseErrorShape], ResponseErrorShape]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["discriminant_value"]
        ) -> typing.Callable[
            [typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]],
            typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["shape"]
        ) -> typing.Callable[
            [typing.Callable[[ResponseErrorShape], ResponseErrorShape]],
            typing.Callable[[ResponseErrorShape], ResponseErrorShape],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "discriminant_value":
                    cls._discriminant_value.append(validator)
                elif field_name == "shape":
                    cls._shape.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ResponseErrorV2: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
