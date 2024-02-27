from fern_python.codegen import AST
from dataclasses import dataclass
import fern.generator_exec.resources as generator_exec

@dataclass
class EndpointExpression:
    endpoint_id: generator_exec.EndpointIdentifier
    expr: AST.Expression
