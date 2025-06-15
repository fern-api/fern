import difflib
import json

from typing import Any, Union

from seed.core.pydantic_utilities import UniversalBaseModel

def _assert_json_eq(expected: str, actual: str) -> None:
    """Compare two JSON strings for equality, ignoring key order."""

    # for ordering invariance and ease of diffing, re-serialize as sorted JSON
    def reserialize_as_ordered(json_obj: str) -> str:
        return json.dumps(json.loads(json_obj), indent=2, sort_keys=True)

    expected = reserialize_as_ordered(expected)
    actual = reserialize_as_ordered(actual)

    if expected != actual:
        diff = "\n".join(
            difflib.unified_diff(
                expected.splitlines(),
                actual.splitlines(),
                fromfile="expected",
                tofile="actual",
                lineterm="",
            )
        )
        raise AssertionError(f"JSON mismatch:\n\n{diff}")

# TODO(rmehndiratta): We should extend this to non-JSON response types down the line.
def assert_response_matches(expected: dict[str, Any], actual: dict[str, Any]):
    _assert_json_eq(json.dumps(expected), json.dumps(actual))

def assert_response_matches_model(expected: dict[str, Any], actual: UniversalBaseModel):
    _assert_json_eq(json.dumps(expected), actual.model_dump_json())
