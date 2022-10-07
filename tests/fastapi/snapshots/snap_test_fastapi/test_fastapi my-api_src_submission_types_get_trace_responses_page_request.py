import typing

import pydantic
import typing_extensions


class GetTraceResponsesPageRequest(pydantic.BaseModel):
    offset: typing.Optional[int]

    @pydantic.validator("offset")
    def _validate_offset(cls, offset: typing.Optional[int]) -> typing.Optional[int]:
        for validator in GetTraceResponsesPageRequest.Validators._offset:
            offset = validator(offset)
        return offset

    class Validators:
        _offset: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[int]], typing.Optional[int]]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["offset"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[int]], typing.Optional[int]]],
            typing.Callable[[typing.Optional[int]], typing.Optional[int]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "offset":
                    cls._offset.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GetTraceResponsesPageRequest: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
