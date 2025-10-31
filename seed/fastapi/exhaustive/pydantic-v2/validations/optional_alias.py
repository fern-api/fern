from ..resources.types import OptionalAlias
from typing import Optional

@OptionalAlias.Validators.validate
def validate(x: Optional[str]) -> Optional[str]:
    return x.upper() if x else None
