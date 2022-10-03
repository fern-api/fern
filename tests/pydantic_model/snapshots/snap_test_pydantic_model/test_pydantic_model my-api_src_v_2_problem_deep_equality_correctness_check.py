import typing

import pydantic

from .parameter_id import ParameterId


class DeepEqualityCorrectnessCheck(pydantic.BaseModel):
    expected_value_parameter_id: ParameterId = pydantic.Field(alias="expectedValueParameterId")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
