from __future__ import annotations

from typing import TYPE_CHECKING, Optional, Sequence, Tuple

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import Reference


class CallableInvocation(AstNode):
    def __init__(
        self,
        callable: Reference,
        args: Sequence[Expression] = [],
        kwargs: Sequence[Tuple[str, Expression]] = [],
    ):
        self.callable = callable
        self.args = args or []
        self.kwargs = kwargs or []

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.references.add(self.callable)
        for arg in self.args:
            metadata.update(arg.get_metadata())
        for kwarg in self.kwargs:
            metadata.update(kwarg[1].get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write_reference(self.callable)
        writer.write("(")
        just_wrote_argument = False
        for i, arg in enumerate(self.args):
            if just_wrote_argument:
                writer.write(", ")
            arg.write(writer=writer, should_write_as_snippet=should_write_as_snippet)
            just_wrote_argument = True
        for i, (name, value) in enumerate(self.kwargs):
            if just_wrote_argument:
                writer.write(", ")
            writer.write(f"{name}=")
            value.write(writer=writer, should_write_as_snippet=should_write_as_snippet)
            just_wrote_argument = True
        if just_wrote_argument and (
            (should_write_as_snippet is None or should_write_as_snippet) and writer.should_format_as_snippet()
        ):
            writer.write(", ")
        writer.write(")")


if TYPE_CHECKING:
    from ..expression import Expression
