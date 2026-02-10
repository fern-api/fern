"""Tests for pypi_classifier_creator module."""

from typing import List, Optional

from fern_python.codegen.pypi_classifier_creator import PyPIClassifierMetadataGenerator
from fern_python.version import PythonVersion

from fern.generator_exec import BasicLicense, LicenseConfig, LicenseId


def create_license_config(license_id: LicenseId) -> LicenseConfig:
    """Create a LicenseConfig for testing."""
    return LicenseConfig.factory.basic(BasicLicense(id=license_id))


def build_expected_classifiers(
    versions: List[PythonVersion],
    license_id: Optional[LicenseId] = None,
) -> List[str]:
    """Build expected classifier list using the class constants."""
    python_classifiers = list(PyPIClassifierMetadataGenerator.PYTHON_BASE_CLASSIFIERS)
    for v in versions:
        python_classifiers.append(f"Programming Language :: Python :: {v.spec.to_string()}")

    classifiers = (
        list(PyPIClassifierMetadataGenerator.CLASSIFIERS_PREFIX)
        + python_classifiers
        + list(PyPIClassifierMetadataGenerator.CLASSIFIERS_SUFFIX)
    )

    if license_id is not None:
        license_classifier = PyPIClassifierMetadataGenerator.LICENSE_CLASSIFIERS.get(license_id)
        if license_classifier is not None:
            classifiers.append(license_classifier)

    return classifiers


class TestCreateClassifiers:
    """Tests for PyPIClassifierMetadataGenerator.create_classifiers."""

    def test_generates_classifiers_for_version_constraint(self) -> None:
        """Test that classifiers are generated correctly for a version constraint."""
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers(">=3.9,<3.12")

        expected = build_expected_classifiers(
            [
                PythonVersion.PY3_9,
                PythonVersion.PY3_10,
                PythonVersion.PY3_11,
            ]
        )
        assert classifiers == expected

    def test_generates_classifiers_for_all_versions(self) -> None:
        """Test that ^3.8 includes all versions."""
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers("^3.8")

        expected = build_expected_classifiers(PythonVersion.all())
        assert classifiers == expected

    def test_no_license_classifier_when_none(self) -> None:
        """Test no license classifier when license is None."""
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers("~3.10", None)

        # Should not contain any license classifier
        license_classifiers = [c for c in classifiers if c.startswith("License ::")]
        assert len(license_classifiers) == 0


class TestLicenseClassifiers:
    """Tests for license classifier generation."""

    def test_mit_license(self) -> None:
        """Test MIT license classifier is appended."""
        license_config = create_license_config(LicenseId.MIT)
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers("~3.10", license_config)

        assert classifiers[-1] == PyPIClassifierMetadataGenerator.LICENSE_CLASSIFIERS[LicenseId.MIT]

    def test_apache_2_license(self) -> None:
        """Test Apache-2 license classifier is appended."""
        license_config = create_license_config(LicenseId.APACHE_2)
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers("~3.10", license_config)

        assert classifiers[-1] == PyPIClassifierMetadataGenerator.LICENSE_CLASSIFIERS[LicenseId.APACHE_2]

    def test_license_with_version_constraint(self) -> None:
        """Test full output with license and version constraint."""
        license_config = create_license_config(LicenseId.MIT)
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers(">=3.9,<3.12", license_config)

        expected = build_expected_classifiers(
            [PythonVersion.PY3_9, PythonVersion.PY3_10, PythonVersion.PY3_11],
            license_id=LicenseId.MIT,
        )
        assert classifiers == expected


class TestClassifierIntegrity:
    """Tests for classifier format validity."""

    def test_no_duplicates(self) -> None:
        """Test that there are no duplicate classifiers."""
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers("^3.8")

        assert len(classifiers) == len(set(classifiers))

    def test_valid_format(self) -> None:
        """Test that all classifiers contain the :: separator."""
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers("^3.8")

        for c in classifiers:
            assert " :: " in c, f"Invalid classifier format: {c}"
