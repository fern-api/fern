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
        _response: typing.ClassVar[typing.Any] = []

        @typing.overload
        @classmethod
        def field(response: typing_extensions.Literal["response"]) -> typing.Any:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "response":
                    cls._response.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on LangServerResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
