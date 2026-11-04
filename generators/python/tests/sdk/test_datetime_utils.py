import datetime as dt
import time
from typing import Iterator

import pytest

from core_utilities.shared.datetime_utils import serialize_datetime


@pytest.fixture
def new_york_local_time(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    if not hasattr(time, "tzset"):
        pytest.skip("time.tzset is not available on this platform")
    monkeypatch.setenv("TZ", "America/New_York")
    time.tzset()
    try:
        yield
    finally:
        monkeypatch.undo()
        time.tzset()


def test_serialize_aware_datetime() -> None:
    assert serialize_datetime(dt.datetime(2026, 1, 15, 12, 0, tzinfo=dt.timezone.utc)) == "2026-01-15T12:00:00Z"
    assert (
        serialize_datetime(dt.datetime(2026, 1, 15, 12, 0, tzinfo=dt.timezone(dt.timedelta(hours=5))))
        == "2026-01-15T12:00:00+05:00"
    )


@pytest.mark.usefixtures("new_york_local_time")
def test_serialize_naive_datetime_uses_offset_for_its_own_date() -> None:
    # New York is UTC-5 in winter (EST) and UTC-4 in summer (EDT), whatever today's offset is.
    assert serialize_datetime(dt.datetime(2026, 1, 15, 12, 0)) == "2026-01-15T12:00:00-05:00"
    assert serialize_datetime(dt.datetime(2026, 7, 15, 12, 0)) == "2026-07-15T12:00:00-04:00"


@pytest.mark.usefixtures("new_york_local_time")
def test_serialize_naive_datetime_keeps_wall_clock_time_in_dst_gap() -> None:
    # 02:30 does not exist in New York on 2026-03-08 (clocks jump from 02:00 to 03:00).
    assert serialize_datetime(dt.datetime(2026, 3, 8, 2, 30)).startswith("2026-03-08T02:30:00")
