from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

from .module import Module
from .qualfied_name import QualifiedName


@dataclass(frozen=True)
class ReferenceImport:
    module: Module
    named_import: Optional[str] = None
    alias: Optional[str] = None
    # Used if there is an alternative way to import the dependency (e.g pydantic v1 vs v2)
    alternative_import: Optional[ReferenceImport] = None
    mypy_ignore: Optional[bool] = None


@dataclass(frozen=True)
class Reference:
    qualified_name_excluding_import: QualifiedName
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

    is_forward_reference: bool = False
    """
    if True, "from __future__ import annotations" is added to the file
    """

    must_import_after_current_declaration: bool = False
    """
    in Python 3.7+, annotations can be imported after they're used, with:
      from __future__ import annotations.
    for built-ins and non-annotation references, this field is ignored.
    """

    import_if_type_checking: bool = False
    """
    Adding this paradigm as it's more common to do this than it is to have
    imports at the bottom of the file.

    This is what it looks like in practice:
    ```
    if TYPE_CHECKING:
        from typing import List
    ```
    """

    require_postponed_annotations: bool = False
    """
    Certain functionality may call for `from __future__ import annotations`
    This flag is meant to force that behavior.
    This was originally added to ensure the use of NotRequired for TypedDicts
    brings in this import.
    """

    generic: Optional[Any] = None
