import typing

import pydantic
import typing_extensions

from ...commons.with_docs import WithDocs
from ...types.type_reference import TypeReference


class WebSocketRequest(WithDocs):
    type: typing.Optional[TypeReference]

    @pydantic.validator("type")
    def _validate_type(cls, type: typing.Optional[TypeReference]) -> typing.Optional[TypeReference]:
        for validator in WebSocketRequest.Validators._type:
            type = validator(type)
        return type

    class Validators:
        _type: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[TypeReference]], typing.Optional[TypeReference]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["type"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[TypeReference]], typing.Optional[TypeReference]]],
            typing.Callable[[typing.Optional[TypeReference]], typing.Optional[TypeReference]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "type":
                    cls._type.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WebSocketRequest: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
