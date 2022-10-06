import typing

import pydantic


class FernConstants(pydantic.BaseModel):
    error_discriminant: str = pydantic.Field(alias="errorDiscriminant")
    unknown_error_discriminant_value: str = pydantic.Field(alias="unknownErrorDiscriminantValue")
    error_instance_id_key: str = pydantic.Field(alias="errorInstanceIdKey")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
