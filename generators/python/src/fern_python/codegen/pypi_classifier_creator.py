"""Creates PyPI trove classifier metadata for pyproject.toml."""

from __future__ import annotations

from typing import Dict, List, Optional, cast

from fern_python.version import get_matching_python_versions

from fern.generator_exec import BasicLicense, LicenseConfig, LicenseId


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

    # Mapping from LicenseId to PyPI classifier string
    LICENSE_CLASSIFIERS: Dict[LicenseId, str] = {
        LicenseId.MIT: "License :: OSI Approved :: MIT License",
        LicenseId.APACHE_2: "License :: OSI Approved :: Apache Software License",
    }

    @staticmethod
    def create_classifiers(
        python_version: str,
        license_: Optional[LicenseConfig] = None,
    ) -> List[str]:
        """
        Generate the complete list of PyPI classifiers for pyproject.toml.

        Args:
            python_version: A version constraint string like "^3.8", ">=3.9", etc.
            license_: Optional license configuration.

        Returns:
            A complete list of classifier strings.
        """
        classifiers: List[str] = [
            *PyPIClassifierMetadataGenerator.CLASSIFIERS_PREFIX,
            *PyPIClassifierMetadataGenerator._create_python_programming_language_classifiers(python_version),
            *PyPIClassifierMetadataGenerator.CLASSIFIERS_SUFFIX,
        ]

        license_classifier = PyPIClassifierMetadataGenerator._get_license_classifier(license_)
        if license_classifier is not None:
            classifiers.append(license_classifier)

        return classifiers

    @staticmethod
    def _create_python_programming_language_classifiers(python_version_constraint: str) -> List[str]:
        """Generate Python version classifier strings."""
        versions = get_matching_python_versions(python_version_constraint)

        classifiers: List[str] = list(PyPIClassifierMetadataGenerator.PYTHON_BASE_CLASSIFIERS)

        for py_version in versions:
            classifiers.append(f"Programming Language :: Python :: {py_version.spec.to_string()}")

        return classifiers

    @staticmethod
    def _get_license_classifier(license_: Optional[LicenseConfig]) -> Optional[str]:
        """Get the license classifier string if applicable."""
        if license_ is None:
            return None

        license_union = license_.get_as_union()
        if license_union.type != "basic":
            return None

        license_id = cast(BasicLicense, license_union).id
        return PyPIClassifierMetadataGenerator.LICENSE_CLASSIFIERS.get(license_id)
