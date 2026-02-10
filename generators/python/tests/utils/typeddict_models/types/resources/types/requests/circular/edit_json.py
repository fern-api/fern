from __future__ import annotations

import typing
import typing_extensions

from .....core.serialization import FieldMetadata

if typing.TYPE_CHECKING:
    from .edit_object_json import EditObjectJsonParams


class EditJsonParams(typing_extensions.TypedDict):
    description: typing_extensions.NotRequired[str]
    extend_edit_bbox: typing_extensions.NotRequired[
        typing_extensions.Annotated[typing.Dict[str, typing.Any], FieldMetadata(alias="extend_edit:bbox")]
    ]
    items: typing_extensions.NotRequired["EditObjectJsonParams"]
