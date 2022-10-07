import typing

import pydantic
import typing_extensions


class LangServerResponse(pydantic.BaseModel):
    response: typing.Any

    @pydantic.validator("response")
    def _validate_response(cls, response: typing.Any) -> typing.Any:
        for validator in LangServerResponse.Validators._response:
            response = validator(response)
        return response

    class Validators:
        _response: typing.ClassVar[typing.List[typing.Callable[[typing.Any], typing.Any]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["response"]
        ) -> typing.Callable[[typing.Callable[[typing.Any], typing.Any]], typing.Callable[[typing.Any], typing.Any]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "response":
                    cls._response.append(validator)
                else:
                    raise RuntimeError("Field does not exist on LangServerResponse: " + field_name)

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
