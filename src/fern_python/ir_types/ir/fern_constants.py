from pydantic import BaseModel, Field


class FernConstants(BaseModel):
    error_discriminant: str = Field(alias="errorDiscriminant")
    unknown_error_discriminant_value: str = Field(alias="unknownErrorDiscriminantValue")
    error_instance_id_key: str = Field(alias="errorInstanceIdKey")
