"""Utilities for Python version constraint parsing.

Uses poetry-core to parse version constraints (^, ~, >=, etc.) and determine
which Python versions satisfy them.

This module is used for:
- Generating PyPI classifier metadata (Programming Language :: Python :: X.Y)
- Determining the minimum Python version for CI workflows
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Optional

from poetry.core.constraints.version import Version, parse_constraint


@dataclass(frozen=True, order=True)
class PythonVersionSpec:
    """Represents a Python major.minor version."""

    major: int
    minor: int

    def to_string(self) -> str:
        return f"{self.major}.{self.minor}"

    def to_poetry_version(self) -> Version:
        return Version.parse(self.to_string())


class PythonVersion(Enum):
    """
    All known Python versions.
    Update this enum as new Python versions are released.
    """

    PY3_8 = PythonVersionSpec(3, 8)
    PY3_9 = PythonVersionSpec(3, 9)
    PY3_10 = PythonVersionSpec(3, 10)
    PY3_11 = PythonVersionSpec(3, 11)
    PY3_12 = PythonVersionSpec(3, 12)
    PY3_13 = PythonVersionSpec(3, 13)
    PY3_14 = PythonVersionSpec(3, 14)
    PY3_15 = PythonVersionSpec(3, 15)

    @property
    def spec(self) -> PythonVersionSpec:
        return self.value

    @classmethod
    def all(cls) -> list[PythonVersion]:
        """Returns all Python versions in order."""
        return list(cls)


def get_matching_python_versions(python_version_constraint: str) -> list[PythonVersion]:
    """
    Given a Python version constraint string (Poetry or PEP 440 format),
    return the list of Python versions that satisfy the constraint.

    Args:
        python_version_constraint: A version constraint string like "^3.8", ">=3.9", "~3.10", etc.

    Returns:
        A list of PythonVersion enum members that satisfy the constraint.

    Examples:
        >>> get_matching_python_versions("^3.8")
        [PY3_8, PY3_9, PY3_10, ...]

        >>> get_matching_python_versions("^3.10")
        [PY3_10, PY3_11, PY3_12, ...]

        >>> get_matching_python_versions(">=3.9,<3.12")
        [PY3_9, PY3_10, PY3_11]
    """
    constraint = parse_constraint(python_version_constraint)

    return [py_version for py_version in PythonVersion if constraint.allows(py_version.spec.to_poetry_version())]


def get_minimum_compatible_version(python_version_constraint: str) -> Optional[PythonVersion]:
    matching_versions = get_matching_python_versions(python_version_constraint)
    if not matching_versions:
        return None
    return matching_versions[0]
