from __future__ import annotations

from typing import TYPE_CHECKING, Sequence, Tuple

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import Reference
from ..callable_invocation import CallableInvocation


class FunctionInvocation(AstNode):
    def __init__(
        self,
        function_definition: Reference,
        args: Sequence[Expression] = None,
        kwargs: Sequence[Tuple[str, Expression]] = None,
    ):
        self._callable_invocation = CallableInvocation(callable=function_definition, args=args, kwargs=kwargs)

    def get_metadata(self) -> AstNodeMetadata:
        return self._callable_invocation.get_metadata()

    def write(self, writer: NodeWriter) -> None:
        return self._callable_invocation.write(writer=writer)


if TYPE_CHECKING:
    from ..expression import Expression
