import typing

import pydantic
import typing_extensions

from .function_signature import FunctionSignature


class GetFunctionSignatureRequest(pydantic.BaseModel):
    function_signature: FunctionSignature = pydantic.Field(alias="functionSignature")

    @pydantic.validator("function_signature")
    def _validate_function_signature(cls, function_signature: FunctionSignature) -> FunctionSignature:
        for validator in GetFunctionSignatureRequest.Validators._function_signature:
            function_signature = validator(function_signature)
        return function_signature

    class Validators:
        _function_signature: typing.ClassVar[FunctionSignature] = []

        @typing.overload
        @classmethod
        def field(function_signature: typing_extensions.Literal["function_signature"]) -> FunctionSignature:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "function_signature":
                    cls._function_signature.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on GetFunctionSignatureRequest: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
