import typing

import pydantic

from .single_union_type import SingleUnionType


class UnionTypeDeclaration(pydantic.BaseModel):
    discriminant: str
    types: typing.List[SingleUnionType]
