import typing

import pydantic

from .variable_value import VariableValue


class TestCase(pydantic.BaseModel):
    id: str
    params: typing.List[VariableValue]
