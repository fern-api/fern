import tempfile
from pathlib import Path

from syrupy.assertion import SnapshotAssertion

from fern_python.codegen.ast.dependency.dependency import Dependency
from fern_python.codegen.dependency_manager import DependencyManager
from fern_python.codegen.pyproject_toml import PyProjectToml, PyProjectTomlPackageConfig


class TestParseCaratConstraint:
    """Test the _parse_caret_constraint helper function."""

    def test_simple_major_version(self) -> None:
        result = PyProjectToml._parse_caret_constraint("^3.9")
        assert result == ">=3.9,<4.0"

    def test_full_semver(self) -> None:
        result = PyProjectToml._parse_caret_constraint("^1.2.3")
        assert result == ">=1.2.3,<2.0.0"

    def test_zero_major_version(self) -> None:
        result = PyProjectToml._parse_caret_constraint("^0.2.3")
        assert result == ">=0.2.3,<0.3.0"

    def test_zero_major_minor(self) -> None:
        result = PyProjectToml._parse_caret_constraint("^0.0.5")
        assert result == ">=0.0.5,<0.1.0"

    def test_no_carat_passthrough(self) -> None:
        result = PyProjectToml._parse_caret_constraint(">=3.9")
        assert result == ">=3.9"

    def test_simple_version_no_carat(self) -> None:
        result = PyProjectToml._parse_caret_constraint("3.9.0")
        assert result == "3.9.0"


class TestProjectBlockToString:
    """Test the ProjectBlock.to_string() method."""

    def test_basic_project_block(self, snapshot: SnapshotAssertion) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        result = block.to_string()
        assert result == snapshot

    def test_python_version_without_carat(self, snapshot: SnapshotAssertion) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version=">=3.8",
        )

        result = block.to_string()
        assert result == snapshot

    def test_extras_handling(self, snapshot: SnapshotAssertion) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        extras = {
            "cli": ["click>=8.0.0", "rich>=10.0.0"],
            "async": ["aiohttp>=3.8.0"],
        }

        result = block.to_string(extras=extras)
        assert result == snapshot

    def test_no_duplicate_optional_dependencies_section(self) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        extras = {"cli": ["click>=8.0.0"]}
        result = block.to_string(extras=extras)

        # Should only have one [project.optional-dependencies] section
        assert result.count("[project.optional-dependencies]") == 1


class TestDepsToString:
    """Test the _deps_to_pep621_string() method."""

    def test_basic_dependency(self) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        deps = {Dependency(name="requests", version="==2.28.0")}
        result = block._deps_to_pep621_string(deps)

        assert len(result) == 1
        assert result[0] == '"requests==2.28.0"'

    def test_dependency_with_greater_than_or_equal(self) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        deps = {Dependency(name="requests", version=">=2.28.0")}
        result = block._deps_to_pep621_string(deps)

        assert len(result) == 1
        assert result[0] == '"requests>=2.28.0"'

    def test_dependency_with_extras(self) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        deps = {
            Dependency(
                name="requests",
                version=">=2.28.0",
                extras=("socks", "security"),
            )
        }
        result = block._deps_to_pep621_string(deps)

        assert len(result) == 1
        assert result[0] == '"requests[security,socks]>=2.28.0"'

    def test_dependency_with_python_constraint_carat(self) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        deps = {
            Dependency(
                name="typing-extensions",
                version=">=4.0.0",
                python="^3.9",
            )
        }
        result = block._deps_to_pep621_string(deps)

        assert len(result) == 1
        assert result[0] == "\"typing-extensions>=4.0.0; python_version >= '3.9' and python_version < '4.0'\""

    def test_dependency_with_python_constraint_simple(self) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        deps = {
            Dependency(
                name="typing-extensions",
                version=">=4.0.0",
                python=">=3.9",
            )
        }
        result = block._deps_to_pep621_string(deps)

        assert len(result) == 1
        assert result[0] == "\"typing-extensions>=4.0.0; python_version >= '3.9'\""

    def test_optional_dependencies_skipped(self) -> None:
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        deps = {
            Dependency(name="requests", version="==2.28.0"),
            Dependency(name="optional-dep", version="==1.0.0", optional=True),
        }
        result = block._deps_to_pep621_string(deps)

        # Should only include non-optional dependency
        assert len(result) == 1
        assert '"requests' in result[0]
        assert "optional-dep" not in str(result)

    def test_dependency_name_normalization(self) -> None:
        """Test that dots in package names are converted to dashes."""
        package = PyProjectTomlPackageConfig(include="my_package")
        block = PyProjectToml.ProjectBlock(
            name="test-package",
            version="1.0.0",
            package=package,
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
            python_version="^3.9",
        )

        deps = {Dependency(name="fern.api", version="==1.0.0")}
        result = block._deps_to_pep621_string(deps)

        assert len(result) == 1
        assert result[0] == '"fern-api==1.0.0"'


class TestPyProjectTomlIntegration:
    """Integration tests for full pyproject.toml generation."""

    def test_write_basic_pyproject_toml(self, snapshot: SnapshotAssertion) -> None:
        """Test writing a basic pyproject.toml file."""
        with tempfile.TemporaryDirectory() as tmpdir:
            dep_manager = DependencyManager()
            dep_manager.add_dependency(Dependency(name="requests", version="==2.28.0"))
            dep_manager.add_dev_dependency(Dependency(name="black", version="==23.0.0"))

            package = PyProjectTomlPackageConfig(include="my_package")

            pyproject = PyProjectToml(
                name="test-package",
                version="1.0.0",
                package=package,
                path=tmpdir,
                dependency_manager=dep_manager,
                python_version="^3.9",
                pypi_metadata=None,
                github_output_mode=None,
                license_=None,
            )

            pyproject.write()

            toml_path = Path(tmpdir) / "pyproject.toml"
            content = toml_path.read_text()
            assert content == snapshot

    def test_write_with_extras(self, snapshot: SnapshotAssertion) -> None:
        """Test writing pyproject.toml with extras."""
        with tempfile.TemporaryDirectory() as tmpdir:
            dep_manager = DependencyManager()

            package = PyProjectTomlPackageConfig(include="my_package")

            extras = {
                "cli": ["click>=8.0.0", "rich>=10.0.0"],
                "async": ["aiohttp>=3.8.0"],
            }

            pyproject = PyProjectToml(
                name="test-package",
                version="1.0.0",
                package=package,
                path=tmpdir,
                dependency_manager=dep_manager,
                python_version="^3.9",
                pypi_metadata=None,
                github_output_mode=None,
                license_=None,
                extras=extras,
            )

            pyproject.write()

            toml_path = Path(tmpdir) / "pyproject.toml"
            content = toml_path.read_text()
            assert content == snapshot

    def test_snapshot_full_pyproject_toml(self, snapshot: SnapshotAssertion) -> None:
        """Snapshot test for a complete pyproject.toml with all features."""
        with tempfile.TemporaryDirectory() as tmpdir:
            dep_manager = DependencyManager()
            dep_manager.add_dependency(
                Dependency(
                    name="requests",
                    version=">=2.28.0",
                )
            )
            dep_manager.add_dependency(
                Dependency(
                    name="pydantic",
                    version=">=2.0.0",
                    extras=("email",),
                )
            )
            dep_manager.add_dependency(
                Dependency(
                    name="typing-extensions",
                    version=">=4.0.0",
                    python="^3.9",
                )
            )
            dep_manager.add_dev_dependency(Dependency(name="ruff", version="==0.1.0"))

            package = PyProjectTomlPackageConfig(include="my_package", _from="src")

            extras = {
                "cli": ["click>=8.0.0"],
                "all": ["click>=8.0.0", "aiohttp>=3.8.0"],
            }

            pyproject = PyProjectToml(
                name="test-package",
                version="1.0.0",
                package=package,
                path=tmpdir,
                dependency_manager=dep_manager,
                python_version="^3.9",
                pypi_metadata=None,
                github_output_mode=None,
                license_=None,
                extras=extras,
            )

            pyproject.write()

            toml_path = Path(tmpdir) / "pyproject.toml"
            content = toml_path.read_text()
            assert content == snapshot

    def test_pyproject_with_pydantic_v1(self, snapshot: SnapshotAssertion) -> None:
        """Test pyproject.toml generation with pydantic_version set to v1."""
        with tempfile.TemporaryDirectory() as tmpdir:
            dep_manager = DependencyManager()
            package = PyProjectTomlPackageConfig(include="my_package")

            pyproject = PyProjectToml(
                name="test-package",
                version="1.0.0",
                package=package,
                path=tmpdir,
                dependency_manager=dep_manager,
                python_version="^3.9",
                pypi_metadata=None,
                github_output_mode=None,
                license_=None,
                pydantic_version="v1",
            )

            pyproject.write()

            toml_path = Path(tmpdir) / "pyproject.toml"
            content = toml_path.read_text()
            assert content == snapshot
