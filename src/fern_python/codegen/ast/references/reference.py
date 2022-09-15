from dataclasses import dataclass
from typing import Optional, Tuple

from ..dependency import Dependency

ModulePath = Tuple[str, ...]


@dataclass(frozen=True)
class ReferenceImport:
    module: ModulePath
    named_import: Optional[str] = None
    alias: Optional[str] = None
    external_dependency: Optional[Dependency] = None
    at_bottom_of_file: bool = False


@dataclass(frozen=True)
class Reference:

    qualified_name_excluding_import: Tuple[str, ...]
    """
    the qualfied name of the reference "inside" the import.

    example:
        import typing

        l: typing.List # qualified_name_excluding_import == (List,)

    example:
        from typing import List

        l: List # qualified_name_excluding_import == ()
    """

    import_: Optional[ReferenceImport] = None
    """
    not required for built-ins, like str
    """
