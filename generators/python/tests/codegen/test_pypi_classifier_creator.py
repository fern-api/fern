"""Tests for pypi_classifier_creator module."""

from typing import List

from fern_python.codegen.pypi_classifier_creator import PyPIClassifierMetadataGenerator
from fern_python.version import PythonVersion


def build_expected_classifiers(versions: List[PythonVersion]) -> List[str]:
    """Build expected classifier list using the class constants."""
    python_classifiers = list(PyPIClassifierMetadataGenerator.PYTHON_BASE_CLASSIFIERS)
    for v in versions:
        python_classifiers.append(f"Programming Language :: Python :: {v.spec.to_string()}")

    return (
        list(PyPIClassifierMetadataGenerator.CLASSIFIERS_PREFIX)
        + python_classifiers
        + list(PyPIClassifierMetadataGenerator.CLASSIFIERS_SUFFIX)
    )


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

    def test_never_emits_deprecated_license_classifiers(self) -> None:
        """PEP 639 deprecates `License ::` classifiers; the license lives in `[project] license`."""
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers("~3.10")

        assert not any(c.startswith("License ::") for c in classifiers)


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
