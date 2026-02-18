#!/usr/bin/env python3
"""
Simple test script to verify Task 3 specification compliance.
This works around pytest compatibility issues with Python 3.13.
"""

import tempfile
import os
import sys
from pathlib import Path

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from fern_python.generators.sdk.core_utilities.core_utilities import CoreUtilities
from fern_python.generators.sdk.custom_config import SDKCustomConfig
from fern_python.codegen.project import Project, ProjectConfig

def test_core_utilities_exports_aiohttp_clients():
    """Test that core utilities exports DefaultAioHttpClient and DefaultAsyncHttpxClient"""
    print("Testing aiohttp client exports...")

    with tempfile.TemporaryDirectory() as temp_dir:
        project_config = ProjectConfig(
            project_name="test_project",
            package_name="test_package",
        )
        project = Project(config=project_config, path=Path(temp_dir))

        custom_config = SDKCustomConfig(package_name="test-package")
        project_module_path = ("test_package",)

        core_utilities = CoreUtilities(
            has_standard_paginated_endpoints=False,
            has_custom_paginated_endpoints=False,
            project_module_path=project_module_path,
            custom_config=custom_config,
        )

        core_utilities.copy_to_project(project=project)

        # Check that http_client.py was copied with correct exports
        http_client_path = os.path.join(temp_dir, "test_package", "core", "http_client.py")
        assert os.path.exists(http_client_path), f"http_client.py not found at {http_client_path}"

        with open(http_client_path, "r") as f:
            content = f.read()

        # Should contain the aiohttp wrapper classes
        assert "DefaultAioHttpClient" in content, "DefaultAioHttpClient not found in exports"
        assert "DefaultAsyncHttpxClient" in content, "DefaultAsyncHttpxClient not found in exports"
        assert "httpx_aiohttp" in content, "httpx_aiohttp import not found"

        print("✅ Aiohttp client exports test passed")


def test_core_utilities_templates_package_name():
    """Test that package name is correctly templated into error messages"""
    print("Testing package name templating...")

    with tempfile.TemporaryDirectory() as temp_dir:
        project_config = ProjectConfig(
            project_name="test_project",
            package_name="test_package",
        )
        project = Project(config=project_config, path=Path(temp_dir))

        custom_config = SDKCustomConfig(package_name="my-awesome-sdk")
        project_module_path = ("test_package",)

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
        assert "pip install my-awesome-sdk[aiohttp]" in content, "Package name not templated correctly"
        assert "__FERN_SDK_PACKAGE__" not in content, "Template placeholder not replaced"

        print("✅ Package name templating test passed")


def test_core_utilities_fallback_package_name():
    """Test fallback to module path when custom package name not provided"""
    print("Testing package name fallback...")

    with tempfile.TemporaryDirectory() as temp_dir:
        project_config = ProjectConfig(
            project_name="test_project",
            package_name="test_package",
        )
        project = Project(config=project_config, path=Path(temp_dir))

        custom_config = SDKCustomConfig()  # No package_name provided
        project_module_path = ("my", "nested", "package")

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
        assert "pip install my.nested.package[aiohttp]" in content, "Module path fallback not working"

        print("✅ Package name fallback test passed")


def main():
    """Run all tests and report results"""
    print("Running Task 3 specification compliance tests...\n")

    tests = [
        test_core_utilities_exports_aiohttp_clients,
        test_core_utilities_templates_package_name,
        test_core_utilities_fallback_package_name
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ {test.__name__} failed: {e}")
            failed += 1

    print(f"\nResults: {passed} passed, {failed} failed")

    if failed == 0:
        print("🎉 All Task 3 specification requirements met!")
        return True
    else:
        print("⚠️  Some Task 3 requirements not met")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)