import typing

import pydantic
import typing_extensions

from .parameter_id import ParameterId


class DeepEqualityCorrectnessCheck(pydantic.BaseModel):
    expected_value_parameter_id: ParameterId = pydantic.Field(alias="expectedValueParameterId")

    @pydantic.validator("expected_value_parameter_id")
    def _validate_expected_value_parameter_id(cls, expected_value_parameter_id: ParameterId) -> ParameterId:
        for validator in DeepEqualityCorrectnessCheck.Validators._expected_value_parameter_id:
            expected_value_parameter_id = validator(expected_value_parameter_id)
        return expected_value_parameter_id

    class Validators:
        _expected_value_parameter_id: typing.ClassVar[ParameterId] = []

        @typing.overload
        @classmethod
        def field(expected_value_parameter_id: typing_extensions.Literal["expected_value_parameter_id"]) -> ParameterId:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "expected_value_parameter_id":
                    cls._expected_value_parameter_id.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on DeepEqualityCorrectnessCheck: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
