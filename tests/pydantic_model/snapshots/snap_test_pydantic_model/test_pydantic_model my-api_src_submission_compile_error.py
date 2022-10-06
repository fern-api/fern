import typing

import pydantic
import typing_extensions


class CompileError(pydantic.BaseModel):
    message: str

    @pydantic.validator("message")
    def _validate_message(cls, message: str) -> str:
        for validator in CompileError.Validators._message:
            message = validator(message)
        return message

    class Validators:
        _message: typing.ClassVar[str] = []

        @typing.overload
        @classmethod
        def field(message: typing_extensions.Literal["message"]) -> str:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "message":
                    cls._message.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on CompileError: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
