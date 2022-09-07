import typing

import pydantic

from .enum_value import EnumValue


class EnumTypeDeclaration(pydantic.BaseModel):
    values: typing.List[EnumValue]
