import typing

import pydantic
import typing_extensions


class LangServerRequest(pydantic.BaseModel):
    request: typing.Any

    @pydantic.validator("request")
    def _validate_request(cls, request: typing.Any) -> typing.Any:
        for validator in LangServerRequest.Validators._request:
            request = validator(request)
        return request

    class Validators:
        _request: typing.ClassVar[typing.List[typing.Callable[[typing.Any], typing.Any]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["request"]
        ) -> typing.Callable[[typing.Callable[[typing.Any], typing.Any]], typing.Callable[[typing.Any], typing.Any]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "request":
                    cls._request.append(validator)
                else:
                    raise RuntimeError("Field does not exist on LangServerRequest: " + field_name)

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
