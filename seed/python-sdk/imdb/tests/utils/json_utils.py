import difflib
import json


def assert_json_eq(expected: str, actual: str) -> None:
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
