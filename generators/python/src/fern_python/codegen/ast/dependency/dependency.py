from dataclasses import dataclass
from typing import Optional, Tuple

DependencyName = str
DependencyVersion = str


@dataclass(frozen=True)
class Dependency:
    name: DependencyName
    version: DependencyVersion  # Should include operator like "==1.0.0" or ">=1.0.0"
    # Using a tuple here to ensure immutability and make it hashable
    python: Optional[str] = None
    extras: Optional[Tuple[str, ...]] = None
    optional: bool = False
