import typing

import pydantic
import typing_extensions

from ...commons.with_docs import WithDocs
from ...errors.declared_error_name import DeclaredErrorName


class ResponseError(WithDocs):
    error: DeclaredErrorName

    @pydantic.validator("error")
    def _validate_error(cls, error: DeclaredErrorName) -> DeclaredErrorName:
        for validator in ResponseError.Validators._error:
            error = validator(error)
        return error

    class Validators:
        _error: typing.ClassVar[typing.List[typing.Callable[[DeclaredErrorName], DeclaredErrorName]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["error"]
        ) -> typing.Callable[
            [typing.Callable[[DeclaredErrorName], DeclaredErrorName]],
            typing.Callable[[DeclaredErrorName], DeclaredErrorName],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "error":
                    cls._error.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ResponseError: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
