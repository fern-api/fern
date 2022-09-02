import pydantic
import typing
from .declared_type_name import DeclaredTypeName
from .object_property import ObjectProperty


class ObjectTypeDeclaration(pydantic.BaseModel):
    extends: typing.List[DeclaredTypeName]
    properties: typing.List[ObjectProperty]
