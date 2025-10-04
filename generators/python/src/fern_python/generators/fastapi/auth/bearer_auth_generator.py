from .abstract_auth_generator import AbstractAuthGenerator

from fern_python.codegen import AST
from fern_python.external_dependencies import FastAPI


class BearerAuthGenerator(AbstractAuthGenerator):
    def get_dependency(self) -> AST.Expression:
        return FastAPI.Depends(AST.Expression(self._context.core_utilities.HTTPBearer()))

    def get_parsed_auth_type(self) -> AST.TypeHint:
        return AST.TypeHint(type=self._context.core_utilities.BearerToken())
