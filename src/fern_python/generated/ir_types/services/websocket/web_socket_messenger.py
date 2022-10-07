import typing

import pydantic
import typing_extensions

from .web_socket_operation import WebSocketOperation


class WebSocketMessenger(pydantic.BaseModel):
    operations: typing.List[WebSocketOperation]

    @pydantic.validator("operations")
    def _validate_operations(cls, operations: typing.List[WebSocketOperation]) -> typing.List[WebSocketOperation]:
        for validator in WebSocketMessenger.Validators._operations:
            operations = validator(operations)
        return operations

    class Validators:
        _operations: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[WebSocketOperation]], typing.List[WebSocketOperation]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["operations"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[WebSocketOperation]], typing.List[WebSocketOperation]]],
            typing.Callable[[typing.List[WebSocketOperation]], typing.List[WebSocketOperation]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "operations":
                    cls._operations.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WebSocketMessenger: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
