from pydantic import BaseModel


class DeepEqualityCorrectnessCheck(BaseModel):
    expected_value_parameter_id: str = Field(alias="expectedValueParameterId")
