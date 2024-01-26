from __future__ import annotations

from typing import TYPE_CHECKING, Sequence, Tuple

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import ClassReference
from ..callable_invocation import CallableInvocation


class ClassInstantiation(AstNode):
    def __init__(
        self,
        class_: ClassReference,
        args: Sequence[Expression] = None,
        kwargs: Sequence[Tuple[str, Expression]] = None,
    ):
        self.callable_invocation = CallableInvocation(callable=class_, args=args, kwargs=kwargs)

    def get_metadata(self) -> AstNodeMetadata:
        return self.callable_invocation.get_metadata()

    def write(self, writer: NodeWriter) -> None:
        return self.callable_invocation.write(writer=writer)


if TYPE_CHECKING:
    from ..expression import Expression
