from __future__ import annotations

import typing

import pydantic
from core_utilities.shared.unchecked_base_model import UncheckedBaseModel


class TextDetails(UncheckedBaseModel):
    type: typing.Literal["text"] = "text"
    content: typing.Optional[str] = None


class FigureDetails(UncheckedBaseModel):
    type: typing.Literal["figure"] = "figure"
    image_url: typing.Optional[str] = pydantic.Field(alias="imageUrl", default=None)
    figure_type: typing.Optional[str] = pydantic.Field(alias="figureType", default=None)


# Undiscriminated union — no Annotated[..., UnionMetadata(discriminant=...)]
BlockDetails = typing.Union[TextDetails, FigureDetails]


class Block(UncheckedBaseModel):
    """A block within a parsed document chunk — mirrors the Extend API pattern."""

    type: str
    details: typing.Optional[BlockDetails] = None


class Chunk(UncheckedBaseModel):
    """A document chunk containing blocks — mirrors the Extend API pattern.

    Uses ``from __future__ import annotations`` so the ``List["Block"]``
    annotation stays as a ForwardRef at runtime under Pydantic v2.
    """

    title: typing.Optional[str] = None
    blocks: typing.Optional[typing.List[Block]] = None
