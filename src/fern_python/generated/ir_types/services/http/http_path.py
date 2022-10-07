import typing

import pydantic
import typing_extensions

from .http_path_part import HttpPathPart


class HttpPath(pydantic.BaseModel):
    head: str
    parts: typing.List[HttpPathPart]

    @pydantic.validator("head")
    def _validate_head(cls, head: str) -> str:
        for validator in HttpPath.Validators._head:
            head = validator(head)
        return head

    @pydantic.validator("parts")
    def _validate_parts(cls, parts: typing.List[HttpPathPart]) -> typing.List[HttpPathPart]:
        for validator in HttpPath.Validators._parts:
            parts = validator(parts)
        return parts

    class Validators:
        _head: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _parts: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[HttpPathPart]], typing.List[HttpPathPart]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["head"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["parts"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[HttpPathPart]], typing.List[HttpPathPart]]],
            typing.Callable[[typing.List[HttpPathPart]], typing.List[HttpPathPart]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "head":
                    cls._head.append(validator)
                elif field_name == "parts":
                    cls._parts.append(validator)
                else:
                    raise RuntimeError("Field does not exist on HttpPath: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
