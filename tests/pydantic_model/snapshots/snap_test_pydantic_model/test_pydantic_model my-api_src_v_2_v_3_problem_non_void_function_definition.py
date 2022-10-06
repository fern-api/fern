import typing

import pydantic
import typing_extensions

from .function_implementation_for_multiple_languages import FunctionImplementationForMultipleLanguages
from .non_void_function_signature import NonVoidFunctionSignature


class NonVoidFunctionDefinition(pydantic.BaseModel):
    signature: NonVoidFunctionSignature
    code: FunctionImplementationForMultipleLanguages

    @pydantic.validator("signature")
    def _validate_signature(cls, signature: NonVoidFunctionSignature) -> NonVoidFunctionSignature:
        for validator in NonVoidFunctionDefinition.Validators._signature:
            signature = validator(signature)
        return signature

    @pydantic.validator("code")
    def _validate_code(
        cls, code: FunctionImplementationForMultipleLanguages
    ) -> FunctionImplementationForMultipleLanguages:
        for validator in NonVoidFunctionDefinition.Validators._code:
            code = validator(code)
        return code

    class Validators:
        _signature: typing.ClassVar[NonVoidFunctionSignature] = []
        _code: typing.ClassVar[FunctionImplementationForMultipleLanguages] = []

        @typing.overload
        @classmethod
        def field(signature: typing_extensions.Literal["signature"]) -> NonVoidFunctionSignature:
            ...

        @typing.overload
        @classmethod
        def field(code: typing_extensions.Literal["code"]) -> FunctionImplementationForMultipleLanguages:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "signature":
                    cls._signature.append(validator)  # type: ignore
                elif field_name == "code":
                    cls._code.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on NonVoidFunctionDefinition: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
