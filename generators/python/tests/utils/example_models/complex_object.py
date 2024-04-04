import enum
import datetime as dt
import typing
import uuid

from core_utilities.sdk.unchecked_base_model import UncheckedBaseModel
from .union import Shape, UndiscriminatedShape

try:
    import pydantic.v1 as pydantic  # type: ignore
except ImportError:
    import pydantic  # type: ignore

StrEnum = typing.Union[
    typing.AnyStr,
    typing.Literal[
        "STATUS_READY",
        "STATUS_FAILED",
        "STATUS_PAUSED",
        "STATUS_QUEUED",
    ],
]


class Color(str, enum.Enum):
    """
    from seed.enum import Color

    Color.RED
    """

    RED = "red"
    BLUE = "blue"


class ObjectWithOptionalField(UncheckedBaseModel):
    literal_: typing.Optional[typing.Literal["lit_one", "lit_two"]] = pydantic.Field(alias="literal", default="lit_one")
    string: typing.Optional[str] = None
    integer: typing.Optional[int] = None
    long_: typing.Optional[int] = pydantic.Field(alias="long", default=200000)
    double: typing.Optional[float] = None
    bool_: typing.Optional[bool] = pydantic.Field(alias="bool", default=True)
    datetime: typing.Optional[dt.datetime] = None
    date: typing.Optional[dt.date] = None
    uuid_: typing.Optional[uuid.UUID] = pydantic.Field(alias="uuid", default=None)
    base_64: typing.Optional[str] = pydantic.Field(alias="base64", default=None)
    list_: typing.Optional[typing.List[str]] = pydantic.Field(alias="list", default=None)
    set_: typing.Optional[typing.Set[str]] = pydantic.Field(alias="set", default=None)
    map_: typing.Optional[typing.Dict[int, str]] = pydantic.Field(alias="map", default=None)
    str_enum: typing.Optional[StrEnum] = None
    enum: typing.Optional[Color] = None
    union: typing.Optional[Shape] = None
    undiscriminated_union: typing.Optional[UndiscriminatedShape] = None

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, "exclude_unset": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, "exclude_unset": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        smart_union = True
        allow_population_by_field_name = True
        populate_by_name = True
        extra = pydantic.Extra.allow
