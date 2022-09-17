from enum import Enum


class AuthSchemesRequirement(str, Enum):
    ALL = "ALL"
    ANY = "ANY"
