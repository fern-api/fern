# This file was auto-generated by Fern from our API Definition.

from __future__ import annotations

import typing

if typing.TYPE_CHECKING:
    from .cat import Cat
    from .dog import Dog
Animal = typing.Union["Cat", "Dog"]
