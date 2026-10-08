"""Creates PyPI trove classifier metadata for pyproject.toml."""

from __future__ import annotations

from typing import List

from fern_python.version import get_matching_python_versions


class PyPIClassifierMetadataGenerator:
    """Generates PyPI trove classifier metadata for pyproject.toml."""

    # Static classifiers that appear before Python version classifiers
    CLASSIFIERS_PREFIX: List[str] = ["Intended Audience :: Developers"]

    # Static classifiers that appear after Python version classifiers
    CLASSIFIERS_SUFFIX: List[str] = [
        "Operating System :: OS Independent",
        "Operating System :: POSIX",
        "Operating System :: MacOS",
        "Operating System :: POSIX :: Linux",
        "Operating System :: Microsoft :: Windows",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Typing :: Typed",
    ]

    # Base Python classifiers (before version-specific ones)
    PYTHON_BASE_CLASSIFIERS: List[str] = [
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
    ]

    @staticmethod
    def create_classifiers(python_version: str) -> List[str]:
        """
        Generate the complete list of PyPI classifiers for pyproject.toml.
        License is declared via the PEP 639 `[project] license` expression, not a classifier.

        Args:
            python_version: A version constraint string like "^3.8", ">=3.9", etc.

        Returns:
            A complete list of classifier strings.
        """
        return [
            *PyPIClassifierMetadataGenerator.CLASSIFIERS_PREFIX,
            *PyPIClassifierMetadataGenerator._create_python_programming_language_classifiers(python_version),
            *PyPIClassifierMetadataGenerator.CLASSIFIERS_SUFFIX,
        ]

    @staticmethod
    def _create_python_programming_language_classifiers(python_version_constraint: str) -> List[str]:
        """Generate Python version classifier strings."""
        versions = get_matching_python_versions(python_version_constraint)

        classifiers: List[str] = list(PyPIClassifierMetadataGenerator.PYTHON_BASE_CLASSIFIERS)

        for py_version in versions:
            classifiers.append(f"Programming Language :: Python :: {py_version.spec.to_string()}")

        return classifiers
