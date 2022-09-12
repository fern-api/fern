from dataclasses import dataclass

DependencyName = str
DependencyVersion = str


@dataclass(frozen=True)
class Dependency:
    name: DependencyName
    version: DependencyVersion
