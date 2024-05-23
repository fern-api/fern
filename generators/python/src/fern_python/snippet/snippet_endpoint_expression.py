from dataclasses import dataclass
from typing import Optional

import fern.generator_exec.resources as generator_exec

from fern_python.codegen import AST


@dataclass
class EndpointExpression:
    example_id: Optional[str]
    endpoint_id: generator_exec.EndpointIdentifier
    expr: AST.Expression
