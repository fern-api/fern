# This file was auto-generated by Fern from our API Definition.

from __future__ import annotations

import typing

import pydantic
from ...core.pydantic_utilities import IS_PYDANTIC_V2, UniversalBaseModel, update_forward_refs


class Node(UniversalBaseModel):
    """
    Examples
    --------
    from seed.types import Node, Tree

    Node(
        name="root",
        nodes=[
            Node(
                name="left",
            ),
            Node(
                name="right",
            ),
        ],
        trees=[
            Tree(
                nodes=[
                    Node(
                        name="left",
                    ),
                    Node(
                        name="right",
                    ),
                ],
            )
        ],
    )
    """

    name: str
    nodes: typing.Optional[typing.List["Node"]] = None
    trees: typing.Optional[typing.List["Tree"]] = None

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow", frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow


from .tree import Tree  # noqa: E402, F401, I001

update_forward_refs(Node)
