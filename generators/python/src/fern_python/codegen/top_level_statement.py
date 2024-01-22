import uuid
from dataclasses import dataclass, field
from typing import Union

from . import AST

StatementId = Union[str, uuid.UUID]


@dataclass
class TopLevelStatement:
    node: AST.AstNode
    id: StatementId = field(default_factory=uuid.uuid4)

    def get_metadata(self) -> AST.AstNodeMetadata:
        return self.node.get_metadata()
