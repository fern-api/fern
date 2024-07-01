from __future__ import annotations

from typing import TYPE_CHECKING, Optional, Sequence, Tuple

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import ClassReference
from ..callable_invocation import CallableInvocation


class ClassInstantiation(AstNode):
    def __init__(
        self,
        class_: ClassReference,
        args: Sequence[Expression] = [],
        kwargs: Sequence[Tuple[str, Expression]] = [],
    ):
        self.callable_invocation = CallableInvocation(callable=class_, args=args, kwargs=kwargs)

    def get_metadata(self) -> AstNodeMetadata:
        return self.callable_invocation.get_metadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        return self.callable_invocation.write(writer=writer, should_write_as_snippet=should_write_as_snippet)


if TYPE_CHECKING:
    from ..expression import Expression
