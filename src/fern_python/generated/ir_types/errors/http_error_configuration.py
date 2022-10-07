import typing

import pydantic
import typing_extensions


class HttpErrorConfiguration(pydantic.BaseModel):
    status_code: int = pydantic.Field(alias="statusCode")

    @pydantic.validator("status_code")
    def _validate_status_code(cls, status_code: int) -> int:
        for validator in HttpErrorConfiguration.Validators._status_code:
            status_code = validator(status_code)
        return status_code

    class Validators:
        _status_code: typing.ClassVar[typing.List[typing.Callable[[int], int]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["status_code"]
        ) -> typing.Callable[[typing.Callable[[int], int]], typing.Callable[[int], int]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "status_code":
                    cls._status_code.append(validator)
                else:
                    raise RuntimeError("Field does not exist on HttpErrorConfiguration: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
