from dataclasses import dataclass

from fern_python.codegen import AST

import fern.generator_exec as generator_exec


@dataclass
class EndpointExpression:
    example_id: str
    endpoint_id: generator_exec.EndpointIdentifier
    expr: AST.Expression
