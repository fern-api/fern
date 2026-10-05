import importlib.util
import sys
from pathlib import Path

import pytest

CORE_UTILITIES = Path(__file__).resolve().parents[2] / "core_utilities"


@pytest.mark.parametrize("flavor", ["sdk", "pydantic"])
def test_fallback_str_enum_str_returns_value(flavor: str, monkeypatch: pytest.MonkeyPatch) -> None:
    # Force the Python < 3.11 fallback so it is exercised on every interpreter.
    monkeypatch.setattr(sys, "version_info", (3, 10, 0))
    spec = importlib.util.spec_from_file_location(f"_fern_enum_{flavor}", CORE_UTILITIES / flavor / "enum.py")
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    class MarketplaceId(module.StrEnum):  # type: ignore[name-defined, misc]
        WALMART_US = "WALMART_US"

    member = MarketplaceId.WALMART_US
    assert str(member) == "WALMART_US"
    assert f"{member}" == "WALMART_US"
    assert "%s" % member == "WALMART_US"
    assert ",".join(map(str, [member])) == "WALMART_US"
    assert member == "WALMART_US"
