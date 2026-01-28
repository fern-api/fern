import pytest

from fern_python.version import (
    PythonVersion,
    get_matching_python_versions,
    get_minimum_compatible_version,
)


class TestPythonVersionSpec:
    """Tests for PythonVersionSpec dataclass."""

    def test_ordering_3_10_greater_than_3_9(self) -> None:
        """Critical: 3.10 must be greater than 3.9 (not lexicographic string comparison)."""
        assert PythonVersion.PY3_10.spec > PythonVersion.PY3_9.spec
        assert PythonVersion.PY3_9.spec < PythonVersion.PY3_10.spec

        # Verify sorting works correctly
        versions = [PythonVersion.PY3_10.spec, PythonVersion.PY3_9.spec]
        assert sorted(versions) == [PythonVersion.PY3_9.spec, PythonVersion.PY3_10.spec]

    def test_to_string(self) -> None:
        """Test version string generation."""
        assert PythonVersion.PY3_8.spec.to_string() == "3.8"
        assert PythonVersion.PY3_10.spec.to_string() == "3.10"

    def test_frozen(self) -> None:
        """Test that PythonVersionSpec is immutable."""
        with pytest.raises(AttributeError):
            PythonVersion.PY3_10.spec.major = 4  # type: ignore


class TestPythonVersion:
    """Tests for PythonVersion enum."""

    def test_all_versions(self) -> None:
        all_versions = PythonVersion.all()
        version_strings = [v.spec.to_string() for v in all_versions]

        assert version_strings == ["3.8", "3.9", "3.10", "3.11", "3.12", "3.13", "3.14", "3.15"]
        assert [v.spec for v in all_versions] == sorted([v.spec for v in all_versions])


class TestGetMatchingPythonVersions:
    """Tests for get_matching_python_versions function."""

    def test_caret_constraint(self) -> None:
        versions = get_matching_python_versions("^3.10")
        assert versions == [
            PythonVersion.PY3_10,
            PythonVersion.PY3_11,
            PythonVersion.PY3_12,
            PythonVersion.PY3_13,
            PythonVersion.PY3_14,
            PythonVersion.PY3_15,
        ]

    def test_tilde_constraint(self) -> None:
        versions = get_matching_python_versions("~3.10")
        assert versions == [PythonVersion.PY3_10]

    def test_range_constraint(self) -> None:
        versions = get_matching_python_versions(">=3.9,<3.12")

        assert versions == [
            PythonVersion.PY3_9,
            PythonVersion.PY3_10,
            PythonVersion.PY3_11,
        ]

    def test_exact_version(self) -> None:
        versions = get_matching_python_versions("==3.10")

        assert versions == [PythonVersion.PY3_10]

    def test_wildcard_matches_all(self) -> None:
        versions = get_matching_python_versions("*")

        assert versions == PythonVersion.all()

    def test_impossible_constraint_returns_empty(self) -> None:
        versions = get_matching_python_versions("^3.99")
        assert versions == []


class TestGetMinimumCompatibleVersion:
    """Tests for get_minimum_compatible_version function."""

    def test_caret_3_8_returns_3_8(self) -> None:
        """Test ^3.8 returns 3.8 as minimum."""
        min_version = get_minimum_compatible_version("^3.8")
        assert min_version == PythonVersion.PY3_8

    def test_caret_3_10_returns_3_10(self) -> None:
        """Test ^3.10 returns 3.10 as minimum."""
        min_version = get_minimum_compatible_version("^3.10")
        assert min_version == PythonVersion.PY3_10

    def test_range_returns_lower_bound(self) -> None:
        """Test range constraint returns lower bound."""
        min_version = get_minimum_compatible_version(">=3.9,<3.12")
        assert min_version == PythonVersion.PY3_9

    def test_impossible_constraint_returns_none(self) -> None:
        """Test impossible constraint returns None."""
        min_version = get_minimum_compatible_version("^3.99")
        assert min_version is None
