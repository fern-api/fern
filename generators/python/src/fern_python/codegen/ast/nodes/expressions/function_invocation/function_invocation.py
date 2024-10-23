from __future__ import annotations

from typing import TYPE_CHECKING, Optional, Sequence, Tuple

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import Reference
from ..callable_invocation import CallableInvocation


class FunctionInvocation(AstNode):
    def __init__(
        self,
        function_definition: Reference,
        args: Sequence[Expression] = [],
        kwargs: Sequence[Tuple[str, Expression]] = [],
    ):
        self._callable_invocation = CallableInvocation(callable=function_definition, args=args, kwargs=kwargs)

    def get_metadata(self) -> AstNodeMetadata:
        return self._callable_invocation.get_metadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        return self._callable_invocation.write(writer=writer, should_write_as_snippet=should_write_as_snippet)


if TYPE_CHECKING:
    from ..expression import Expression
