from __future__ import annotations

import typing
import typing_extensions

if typing.TYPE_CHECKING:
    from .circular_type_a import CircularTypeA


class CircularTypeB(typing_extensions.TypedDict):
    properties: typing_extensions.NotRequired[typing.Dict[str, "CircularTypeA"]]
