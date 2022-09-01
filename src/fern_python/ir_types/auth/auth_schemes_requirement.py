from enum import Enum


class AuthSchemesRequirement(str, Enum):
    all = "ALL"
    any = "ANY"
