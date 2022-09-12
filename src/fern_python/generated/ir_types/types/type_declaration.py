from ..commons.with_docs import WithDocs
from .declared_type_name import DeclaredTypeName
from .type import Type


class TypeDeclaration(WithDocs):
    name: DeclaredTypeName
    shape: Type
