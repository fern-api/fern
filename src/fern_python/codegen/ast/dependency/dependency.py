from dataclasses import dataclass
from enum import Enum

DependencyName = str
DependencyVersion = str


@dataclass(frozen=True)
class DependencyCompatibility(Enum):
    EXACT = "="
    GREATER_THAN_OR_EQUAL = ">="
    

@dataclass(frozen=True)
class Dependency:
    name: DependencyName
    version: DependencyVersion
    compatibility: DependencyCompatibility = DependencyCompatibility.EXACT

