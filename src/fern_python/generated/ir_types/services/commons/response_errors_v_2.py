import typing

import pydantic
import typing_extensions

from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
from .response_error_v_2 import ResponseErrorV2


class ResponseErrorsV2(pydantic.BaseModel):
    discriminant: WireStringWithAllCasings
    types: typing.List[ResponseErrorV2]

    @pydantic.validator("discriminant")
    def _validate_discriminant(cls, discriminant: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in ResponseErrorsV2.Validators._discriminant:
            discriminant = validator(discriminant)
        return discriminant

    @pydantic.validator("types")
    def _validate_types(cls, types: typing.List[ResponseErrorV2]) -> typing.List[ResponseErrorV2]:
        for validator in ResponseErrorsV2.Validators._types:
            types = validator(types)
        return types

    class Validators:
        _discriminant: typing.ClassVar[
            typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]
        ] = []
        _types: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[ResponseErrorV2]], typing.List[ResponseErrorV2]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["discriminant"]
        ) -> typing.Callable[
            [typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]],
            typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["types"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[ResponseErrorV2]], typing.List[ResponseErrorV2]]],
            typing.Callable[[typing.List[ResponseErrorV2]], typing.List[ResponseErrorV2]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "discriminant":
                    cls._discriminant.append(validator)
                elif field_name == "types":
                    cls._types.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ResponseErrorsV2: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
