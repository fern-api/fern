import typing

import pydantic
import typing_extensions


class RuntimeError(pydantic.BaseModel):
    message: str

    @pydantic.validator("message")
    def _validate_message(cls, message: str) -> str:
        for validator in RuntimeError.Validators._message:
            message = validator(message)
        return message

    class Validators:
        _message: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["message"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "message":
                    cls._message.append(validator)
                else:
                    raise RuntimeError("Field does not exist on RuntimeError: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
