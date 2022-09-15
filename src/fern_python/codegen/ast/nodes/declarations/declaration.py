from typing import Union

from .class_ import ClassDeclaration
from .function import FunctionDeclaration
from .type_alias import TypeAliasDeclaration
from .variable import VariableDeclaration

Declaration = Union[ClassDeclaration, FunctionDeclaration, TypeAliasDeclaration, VariableDeclaration]
