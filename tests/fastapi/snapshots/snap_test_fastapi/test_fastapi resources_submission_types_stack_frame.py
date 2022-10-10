import typing

import pydantic
import typing_extensions

from .scope import Scope


class StackFrame(pydantic.BaseModel):
    method_name: str = pydantic.Field(alias="methodName")
    line_number: int = pydantic.Field(alias="lineNumber")
    scopes: typing.List[Scope]

    @pydantic.validator("method_name")
    def _validate_method_name(cls, method_name: str) -> str:
        for validator in StackFrame.Validators._method_name:
            method_name = validator(method_name)
        return method_name

    @pydantic.validator("line_number")
    def _validate_line_number(cls, line_number: int) -> int:
        for validator in StackFrame.Validators._line_number:
            line_number = validator(line_number)
        return line_number

    @pydantic.validator("scopes")
    def _validate_scopes(cls, scopes: typing.List[Scope]) -> typing.List[Scope]:
        for validator in StackFrame.Validators._scopes:
            scopes = validator(scopes)
        return scopes

    class Validators:
        _method_name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _line_number: typing.ClassVar[typing.List[typing.Callable[[int], int]]] = []
        _scopes: typing.ClassVar[typing.List[typing.Callable[[typing.List[Scope]], typing.List[Scope]]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["method_name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["line_number"]
        ) -> typing.Callable[[typing.Callable[[int], int]], typing.Callable[[int], int]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["scopes"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[Scope]], typing.List[Scope]]],
            typing.Callable[[typing.List[Scope]], typing.List[Scope]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "method_name":
                    cls._method_name.append(validator)
                elif field_name == "line_number":
                    cls._line_number.append(validator)
                elif field_name == "scopes":
                    cls._scopes.append(validator)
                else:
                    raise RuntimeError("Field does not exist on StackFrame: " + field_name)

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
        allow_population_by_field_name = True
