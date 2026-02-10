from __future__ import annotations

import typing
import typing_extensions

if typing.TYPE_CHECKING:
    from .edit_json import EditJsonParams


class EditObjectJsonParams(typing_extensions.TypedDict):
    properties: typing_extensions.NotRequired[typing.Dict[str, "EditJsonParams"]]
