from dataclasses import dataclass
from typing import Optional, Tuple

ModulePath = Tuple[str, ...]


@dataclass(frozen=True)
class Reference:
    module: ModulePath
    submodule: Optional[str]
    alias: Optional[str]

    name_inside_import: Tuple[str, ...]
    """
    the qualfied name of the reference "inside" the import.

    example:
        import typing

        l: typing.List # name_inside_import == (List,)

    example:
        from typing import List

        l: List # name_inside_import == ()
    """
