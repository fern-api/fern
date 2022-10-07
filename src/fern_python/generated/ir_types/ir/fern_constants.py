import typing

import pydantic
import typing_extensions


class FernConstants(pydantic.BaseModel):
    error_discriminant: str = pydantic.Field(alias="errorDiscriminant")
    unknown_error_discriminant_value: str = pydantic.Field(alias="unknownErrorDiscriminantValue")
    error_instance_id_key: str = pydantic.Field(alias="errorInstanceIdKey")

    @pydantic.validator("error_discriminant")
    def _validate_error_discriminant(cls, error_discriminant: str) -> str:
        for validator in FernConstants.Validators._error_discriminant:
            error_discriminant = validator(error_discriminant)
        return error_discriminant

    @pydantic.validator("unknown_error_discriminant_value")
    def _validate_unknown_error_discriminant_value(cls, unknown_error_discriminant_value: str) -> str:
        for validator in FernConstants.Validators._unknown_error_discriminant_value:
            unknown_error_discriminant_value = validator(unknown_error_discriminant_value)
        return unknown_error_discriminant_value

    @pydantic.validator("error_instance_id_key")
    def _validate_error_instance_id_key(cls, error_instance_id_key: str) -> str:
        for validator in FernConstants.Validators._error_instance_id_key:
            error_instance_id_key = validator(error_instance_id_key)
        return error_instance_id_key

    class Validators:
        _error_discriminant: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _unknown_error_discriminant_value: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _error_instance_id_key: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["error_discriminant"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["unknown_error_discriminant_value"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["error_instance_id_key"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "error_discriminant":
                    cls._error_discriminant.append(validator)
                elif field_name == "unknown_error_discriminant_value":
                    cls._unknown_error_discriminant_value.append(validator)
                elif field_name == "error_instance_id_key":
                    cls._error_instance_id_key.append(validator)
                else:
                    raise RuntimeError("Field does not exist on FernConstants: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
