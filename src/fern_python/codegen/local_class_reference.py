from __future__ import annotations

from . import AST
from .class_parent import ClassParent


class LocalClassReference(AST.ClassReference, ClassParent):
    ...
