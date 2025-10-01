from dataclasses import dataclass

import fern.generator_exec as generator_exec

from fern_python.codegen import AST


@dataclass
class EndpointExpression:
    example_id: str
    endpoint_id: generator_exec.EndpointIdentifier
    expr: AST.Expression
