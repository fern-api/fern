"""Tests for pyproject_toml module."""

import tempfile
from pathlib import Path

import pytest

from fern_python.codegen.pyproject_toml import (
    PyProjectToml,
    PyProjectTomlPackageConfig,
)
from fern_python.codegen.pypi_classifier_creator import PyPIClassifierMetadataGenerator
from poetry.core.factory import Factory


class TestPoetryBlock:
    """Tests for PyProjectToml.PoetryBlock."""

    def _create_block(
        self,
        classifiers: list[str],
        version: str,
    ) -> PyProjectToml.PoetryBlock:
        """Helper to create a PoetryBlock for testing."""
        return PyProjectToml.PoetryBlock(
            name="test-package",
            version=version,
            package=PyProjectTomlPackageConfig(include="test_package", _from="src"),
            classifiers=classifiers,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
        )

    def test_classifiers_reflect_version_constraint(self) -> None:
        """Test that classifiers correctly reflect the version constraint."""
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers(">=3.9,<3.12")
        block = PyProjectToml.PoetryBlock(
            name="test",
            version="1.0.0",
            package=PyProjectTomlPackageConfig(include="test"),
            classifiers=classifiers,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
        )
        output = block.to_string()

        # Should include only 3.9, 3.10, 3.11
        assert "Programming Language :: Python :: 3.9" in output
        assert "Programming Language :: Python :: 3.10" in output
        assert "Programming Language :: Python :: 3.11" in output
        # Should NOT include versions outside range
        assert "Programming Language :: Python :: 3.8" not in output
        assert "Programming Language :: Python :: 3.12" not in output
        assert "Programming Language :: Python :: 3.13" not in output
        assert "Programming Language :: Python :: 3.14" not in output
        assert "Programming Language :: Python :: 3.15" not in output

    def test_to_string_contains_required_fields(self) -> None:
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers(">=3.9,<3.12")
        version = "1.0.0"
        block = self._create_block(classifiers=classifiers, version=version)
        output = block.to_string()

        assert "[tool.poetry]" in output
        assert 'name = "test-package"' in output
        assert f'version = "{version}"' in output
        assert 'readme = "README.md"' in output
        assert 'description = "' in output
        assert "classifiers = " in output
        assert 'include = "test_package"' in output
        assert 'from = "src"' in output


class TestDependenciesBlock:
    """Tests for PyProjectToml.DependenciesBlock."""

    def test_to_string_structure(self) -> None:
        """Test that output has correct structure."""
        python_version = "^3.10"
        block = PyProjectToml.DependenciesBlock(
            dependencies=set(),
            dev_dependencies=set(),
            python_version=python_version,
            enable_wire_tests=False,
        )
        output = block.to_string()

        assert "[tool.poetry.dependencies]" in output
        assert f'python = "{python_version}"' in output
        assert "[tool.poetry.group.dev.dependencies]" in output


class TestBuildSystemBlock:
    """Tests for PyProjectToml.BuildSystemBlock."""

    def test_to_string_structure(self) -> None:
        """Test that output has correct build-system structure."""
        block = PyProjectToml.BuildSystemBlock()
        output = block.to_string()

        assert "[build-system]" in output
        assert 'requires = ["poetry-core"]' in output
        assert 'build-backend = "poetry.core.masonry.api"' in output


class TestPoetryCoreValidation:
    """Validate generated pyproject.toml using poetry-core."""

    def test_generated_toml_is_valid_poetry_project(self) -> None:
        """Test that generated TOML can be parsed by poetry-core Factory."""
        # Build a complete pyproject.toml from all blocks
        python_version = "^3.10"
        classifiers = PyPIClassifierMetadataGenerator.create_classifiers(python_version)

        poetry_block = PyProjectToml.PoetryBlock(
            name="test-package",
            version="1.0.0",
            package=PyProjectTomlPackageConfig(include="test_package", _from="src"),
            classifiers=classifiers,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
        )

        deps_block = PyProjectToml.DependenciesBlock(
            dependencies=set(),
            dev_dependencies=set(),
            python_version=python_version,
            enable_wire_tests=False,
        )

        build_block = PyProjectToml.BuildSystemBlock()

        # Combine all blocks
        toml_content = poetry_block.to_string() + deps_block.to_string() + build_block.to_string()

        # Write to temp file and validate with poetry-core
        with tempfile.TemporaryDirectory() as tmpdir:
            toml_path = Path(tmpdir) / "pyproject.toml"
            toml_path.write_text(toml_content)

            # Create a dummy src/test_package directory structure
            package_dir = Path(tmpdir) / "src" / "test_package"
            package_dir.mkdir(parents=True)
            (package_dir / "__init__.py").write_text("")

            # Factory.create_poetry will raise if the TOML is invalid
            poetry = Factory().create_poetry(Path(tmpdir))

            assert poetry.package.name == "test-package"
            assert str(poetry.package.version) == "1.0.0"
