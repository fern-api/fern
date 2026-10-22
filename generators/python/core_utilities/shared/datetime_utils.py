import datetime as dt
from email.utils import parsedate_to_datetime
from typing import Any

import pydantic

IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")


def parse_rfc2822_datetime(v: Any) -> dt.datetime:
    """
    Parse an RFC 2822 datetime string (e.g., "Wed, 02 Oct 2002 13:00:00 GMT")
    into a datetime object. If the value is already a datetime, return it as-is.
    Falls back to ISO 8601 parsing if RFC 2822 parsing fails.
    """
    if isinstance(v, dt.datetime):
        return v
    if isinstance(v, str):
        try:
            return parsedate_to_datetime(v)
        except Exception:
            pass
        # Fallback to ISO 8601 parsing
        return dt.datetime.fromisoformat(v.replace("Z", "+00:00"))
    raise ValueError(f"Expected str or datetime, got {type(v)}")


class Rfc2822DateTime(dt.datetime):
    """A datetime subclass that parses RFC 2822 date strings.

    On Pydantic V1, uses __get_validators__ for pre-validation.
    On Pydantic V2, uses __get_pydantic_core_schema__ for BeforeValidator-style parsing.
    """

    @classmethod
    def __get_validators__(cls):  # type: ignore[no-untyped-def]
        yield parse_rfc2822_datetime

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> Any:  # type: ignore[override]
        from pydantic_core import core_schema

        return core_schema.no_info_before_validator_function(parse_rfc2822_datetime, core_schema.datetime_schema())


def serialize_datetime(v: dt.datetime) -> str:
    """
    Serialize a datetime including timezone info.

    Uses the timezone info provided if present, otherwise uses the current runtime's timezone info,
    with the UTC offset that applies on that date (so daylight saving time is accounted for).

    UTC datetimes end in "Z" while all other timezones are represented as offset from UTC, e.g. +05:00.
    """

    def _serialize_zoned_datetime(v: dt.datetime) -> str:
        if v.tzinfo is not None and v.tzinfo.tzname(None) == dt.timezone.utc.tzname(None):
            # UTC is a special case where we use "Z" at the end instead of "+00:00"
            return v.isoformat().replace("+00:00", "Z")
        else:
            # Delegate to the typical +/- offset format
            return v.isoformat()

    if v.tzinfo is not None:
        return _serialize_zoned_datetime(v)
    else:
        # astimezone() on a naive datetime treats it as local time and picks the offset for that date,
        # rather than today's offset, which is wrong across a daylight saving time change.
        # Only the offset is used so the wall-clock time is sent as given, even for a time that
        # does not exist locally because of a daylight saving time change.
        try:
            localized_dt = v.replace(tzinfo=dt.timezone(v.astimezone().utcoffset() or dt.timedelta(0)))
        except (OverflowError, OSError, ValueError):
            # Some platforms (e.g. Windows) cannot look up local time for dates outside the epoch range.
            localized_dt = v.replace(tzinfo=dt.datetime.now().astimezone().tzinfo)
        return _serialize_zoned_datetime(localized_dt)
