import uuid
from dataclasses import dataclass, field
from functools import cached_property
from typing import Set, Union

from . import AST

StatementId = Union[str, uuid.UUID]


@dataclass
class TopLevelStatement:
    node: AST.AstNode
    id: StatementId = field(default_factory=uuid.uuid4)

    @cached_property
    def references(self) -> Set[AST.Reference]:
        return self.node.get_references()
