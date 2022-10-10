import typing

import pydantic
import typing_extensions

from .parameter import Parameter


class VoidFunctionSignature(pydantic.BaseModel):
    parameters: typing.List[Parameter]

    @pydantic.validator("parameters")
    def _validate_parameters(cls, parameters: typing.List[Parameter]) -> typing.List[Parameter]:
        for validator in VoidFunctionSignature.Validators._parameters:
            parameters = validator(parameters)
        return parameters

    class Validators:
        _parameters: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[Parameter]], typing.List[Parameter]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["parameters"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[Parameter]], typing.List[Parameter]]],
            typing.Callable[[typing.List[Parameter]], typing.List[Parameter]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "parameters":
                    cls._parameters.append(validator)
                else:
                    raise RuntimeError("Field does not exist on VoidFunctionSignature: " + field_name)

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
