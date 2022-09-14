from dataclasses import dataclass
from typing import Optional, Tuple, Union

from ..dependency import BuiltInModule, Dependency

ModulePath = Tuple[str, ...]


@dataclass(frozen=True)
class Reference:
    module: ModulePath

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

    named_import: Optional[str] = None
    alias: Optional[str] = None

    from_module: Optional[Union[BuiltInModule, Dependency]] = None
    """
    if absent, module is assumed to be local
    """

    at_bottom_of_file: bool = False
