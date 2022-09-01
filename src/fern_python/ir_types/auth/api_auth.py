from typing import List
from .auth_scheme import AuthScheme
from .auth_schemes_requirement import AuthSchemesRequirement
from ..commons.with_docs import WithDocs


class ApiAuth(WithDocs):
    requirement: AuthSchemesRequirement
    schemes: List[AuthScheme]
