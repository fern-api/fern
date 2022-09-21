import pydantic


class FernConstants(pydantic.BaseModel):
    error_discriminant: str = pydantic.Field(alias="errorDiscriminant")
    unknown_error_discriminant_value: str = pydantic.Field(alias="unknownErrorDiscriminantValue")
    error_instance_id_key: str = pydantic.Field(alias="errorInstanceIdKey")

    class Config:
        allow_population_by_field_name = True
