import datetime as dt
import typing
import pydantic
from core_utilities.shared.unchecked_base_model import UncheckedBaseModel


class ObjectWithDefaultedOptionalFields(UncheckedBaseModel):
    literal_: typing.Optional[typing.Literal["lit_one", "lit_two"]] = pydantic.Field(alias="literal", default="lit_one")
    string: typing.Optional[str] = None
    integer: typing.Optional[int] = None
    long_: typing.Optional[int] = pydantic.Field(alias="long", default=200000)
    double: typing.Optional[float] = None
    bool_: typing.Optional[bool] = pydantic.Field(alias="bool", default=True)
    datetime: typing.Optional[dt.datetime] = None
    date: typing.Optional[dt.date] = None

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, "exclude_unset": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, "exclude_unset": True, **kwargs}
        return super().dict(**kwargs_with_defaults)
