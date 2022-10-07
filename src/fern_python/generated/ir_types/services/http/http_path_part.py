import typing

import pydantic
import typing_extensions


class HttpPathPart(pydantic.BaseModel):
    path_parameter: str = pydantic.Field(alias="pathParameter")
    tail: str

    @pydantic.validator("path_parameter")
    def _validate_path_parameter(cls, path_parameter: str) -> str:
        for validator in HttpPathPart.Validators._path_parameter:
            path_parameter = validator(path_parameter)
        return path_parameter

    @pydantic.validator("tail")
    def _validate_tail(cls, tail: str) -> str:
        for validator in HttpPathPart.Validators._tail:
            tail = validator(tail)
        return tail

    class Validators:
        _path_parameter: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _tail: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["path_parameter"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["tail"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "path_parameter":
                    cls._path_parameter.append(validator)
                elif field_name == "tail":
                    cls._tail.append(validator)
                else:
                    raise RuntimeError("Field does not exist on HttpPathPart: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
