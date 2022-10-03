import typing

import pydantic

from ..commons.variable_type import VariableType
from .variable_type_and_name import VariableTypeAndName


class GetDefaultStarterFilesRequest(pydantic.BaseModel):
    input_params: typing.List[VariableTypeAndName] = pydantic.Field(alias="inputParams")
    output_type: VariableType = pydantic.Field(alias="outputType")
    method_name: str = pydantic.Field(alias="methodName")

    class Config:
        allow_population_by_field_name = True
