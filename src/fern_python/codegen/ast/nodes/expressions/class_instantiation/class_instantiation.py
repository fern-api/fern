from __future__ import annotations

from typing import TYPE_CHECKING, Sequence, Set, Tuple

from ....ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ....references import ClassReference, Reference


class ClassInstantiation(AstNode):
    def __init__(
        self,
        class_: ClassReference,
        args: Sequence[Expression] = None,
        kwargs: Sequence[Tuple[str, Expression]] = None,
    ):
        self.class_ = class_
        self.args = args or []
        self.kwargs = kwargs or []

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        references.add(self.class_)
        for arg in self.args:
            references.update(arg.get_references())
        for kwarg in self.kwargs:
            references.update(kwarg[1].get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        for arg in self.args:
            generics.update(arg.get_generics())
        for kwarg in self.kwargs:
            generics.update(kwarg[1].get_generics())
        return generics

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"{reference_resolver.resolve_reference(self.class_)}(")
        for i, arg in enumerate(self.args):
            arg.write(writer=writer, reference_resolver=reference_resolver)
            if i < len(self.args) - 1:
                writer.write(", ")
        for i, (name, value) in enumerate(self.kwargs):
            writer.write(f"{name}=")
            value.write(writer=writer, reference_resolver=reference_resolver)
            if i < len(self.kwargs) - 1:
                writer.write(", ")
        writer.write(")")


if TYPE_CHECKING:
    from ..expression import Expression
