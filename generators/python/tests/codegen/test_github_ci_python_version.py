"""Tests for GithubCIPythonVersionResolver."""

from fern_python.version import GithubCIPythonVersionResolver, PythonVersion


class TestGithubCIPythonVersionResolver:
    def test_resolve_default_constraint_returns_3_10(self) -> None:
        """Default pyproject_python_version (^3.10) should resolve to 3.10 for CI."""
        default_python_version_constraint = "^3.10"
        result = GithubCIPythonVersionResolver.resolve(default_python_version_constraint)
        assert result == PythonVersion.PY3_10

    def test_resolve_uses_minimum_when_3_9_not_in_intersection(self) -> None:
        result = GithubCIPythonVersionResolver.resolve("^3.10")
        assert result == PythonVersion.PY3_10
