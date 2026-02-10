from __future__ import annotations

import typing
import typing_extensions

from .typeddict_models.types.core.serialization import FieldMetadata

if typing.TYPE_CHECKING:
    from .circular_type_b import CircularTypeB


class CircularTypeA(typing_extensions.TypedDict):
    description: typing_extensions.NotRequired[str]
    alias_field: typing_extensions.NotRequired[
        typing_extensions.Annotated[typing.Dict[str, typing.Any], FieldMetadata(alias="alias:field")]
    ]
    items: typing_extensions.NotRequired["CircularTypeB"]
