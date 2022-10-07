import typing

import pydantic
import typing_extensions


class GenericCreateProblemError(pydantic.BaseModel):
    message: str
    type: str
    stacktrace: str

    @pydantic.validator("message")
    def _validate_message(cls, message: str) -> str:
        for validator in GenericCreateProblemError.Validators._message:
            message = validator(message)
        return message

    @pydantic.validator("type")
    def _validate_type(cls, type: str) -> str:
        for validator in GenericCreateProblemError.Validators._type:
            type = validator(type)
        return type

    @pydantic.validator("stacktrace")
    def _validate_stacktrace(cls, stacktrace: str) -> str:
        for validator in GenericCreateProblemError.Validators._stacktrace:
            stacktrace = validator(stacktrace)
        return stacktrace

    class Validators:
        _message: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _type: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _stacktrace: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["message"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["type"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["stacktrace"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "message":
                    cls._message.append(validator)
                elif field_name == "type":
                    cls._type.append(validator)
                elif field_name == "stacktrace":
                    cls._stacktrace.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GenericCreateProblemError: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
