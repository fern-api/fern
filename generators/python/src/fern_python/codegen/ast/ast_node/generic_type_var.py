from dataclasses import dataclass
from typing import Optional, Union

from ..references import ClassReference

GenericTypeVarName = str


@dataclass(frozen=True)
class GenericTypeVar:
    name: GenericTypeVarName
    bound: Optional[Union[str, ClassReference]] = None
