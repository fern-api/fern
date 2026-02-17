import tempfile
import os
from pathlib import Path
import pytest
from fern_python.generators.sdk.core_utilities.core_utilities import CoreUtilities
from fern_python.generators.sdk.custom_config import SDKCustomConfig
from fern_python.codegen.project import Project, ProjectConfig
from fern_python.codegen import AST


def test_core_utilities_exports_aiohttp_clients():
    """Test that core utilities exports DefaultAioHttpClient and DefaultAsyncHttpxClient"""
    with tempfile.TemporaryDirectory() as temp_dir:
        project_config = ProjectConfig(
            project_name="test_project",
            package_name="test_package",
        )
        project = Project(config=project_config, path=Path(temp_dir))

        custom_config = SDKCustomConfig(package_name="test-package")
        project_module_path = AST.ModulePath(("test_package",))

        core_utilities = CoreUtilities(
            has_standard_paginated_endpoints=False,
            has_custom_paginated_endpoints=False,
            project_module_path=project_module_path,
            custom_config=custom_config,
        )

        core_utilities.copy_to_project(project=project)

        # Check that http_client.py was copied with correct exports
        http_client_path = os.path.join(temp_dir, "test_package", "core", "http_client.py")
        assert os.path.exists(http_client_path)

        with open(http_client_path, "r") as f:
            content = f.read()

        # Should contain the aiohttp wrapper classes
        assert "DefaultAioHttpClient" in content
        assert "DefaultAsyncHttpxClient" in content
        assert "httpx_aiohttp" in content


def test_core_utilities_templates_package_name():
    """Test that package name is correctly templated into error messages"""
    with tempfile.TemporaryDirectory() as temp_dir:
        project_config = ProjectConfig(
            project_name="test_project",
            package_name="test_package",
        )
        project = Project(config=project_config, path=Path(temp_dir))

        custom_config = SDKCustomConfig(package_name="my-awesome-sdk")
        project_module_path = AST.ModulePath(("test_package",))

        core_utilities = CoreUtilities(
            has_standard_paginated_endpoints=False,
            has_custom_paginated_endpoints=False,
            project_module_path=project_module_path,
            custom_config=custom_config,
        )

        core_utilities.copy_to_project(project=project)

        # Check that package name was templated correctly
        http_client_path = os.path.join(temp_dir, "test_package", "core", "http_client.py")
        with open(http_client_path, "r") as f:
            content = f.read()

        # Should contain the templated package name
        assert "pip install my-awesome-sdk[aiohttp]" in content
        assert "__FERN_SDK_PACKAGE__" not in content


def test_core_utilities_fallback_package_name():
    """Test fallback to module path when custom package name not provided"""
    with tempfile.TemporaryDirectory() as temp_dir:
        project_config = ProjectConfig(
            project_name="test_project",
            package_name="test_package",
        )
        project = Project(config=project_config, path=Path(temp_dir))

        custom_config = SDKCustomConfig()  # No package_name provided
        project_module_path = AST.ModulePath(("my", "nested", "package"))

        core_utilities = CoreUtilities(
            has_standard_paginated_endpoints=False,
            has_custom_paginated_endpoints=False,
            project_module_path=project_module_path,
            custom_config=custom_config,
        )

        core_utilities.copy_to_project(project=project)

        # Check that module path was used as fallback
        http_client_path = os.path.join(temp_dir, "my", "nested", "package", "core", "http_client.py")
        with open(http_client_path, "r") as f:
            content = f.read()

        # Should contain the module path as package name
        assert "pip install my.nested.package[aiohttp]" in content