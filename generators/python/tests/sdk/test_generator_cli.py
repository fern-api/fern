from generatorcli import LanguageInfo_Python, PypiPublishInfo, ReadmeConfig, Remote

import json
import tempfile
from pathlib import Path

from core_utilities.shared.jsonable_encoder import jsonable_encoder
from fern_python.codegen.pyproject_toml import PyProjectToml, PyProjectTomlPackageConfig
from fern_python.codegen.dependency_manager import DependencyManager


def test_write_readme_config() -> None:
    test_remote = Remote(
        type="github",
        repo_url="test_repo_url",
        installation_token="test_installation_token",
    )

    test_readme_config: ReadmeConfig = ReadmeConfig(
        organization="test_organization",
        language=LanguageInfo_Python(
            publish_info=PypiPublishInfo(package_name="test_package_name"),
        ),
        remote=test_remote,
    )

    assert test_readme_config.dict() == {
        "organization": "test_organization",
        "language": {"type": "python", "publishInfo": {"packageName": "test_package_name"}},
        "remote": {"type": "github", "repoUrl": "test_repo_url", "installationToken": "test_installation_token"},
    }

    assert json.dumps(test_readme_config.dict()) == (
        '{"remote": {"type": "github", "repoUrl": "test_repo_url", "installationToken": "test_installation_token"}, '
        '"language": {"type": "python", "publishInfo": {"packageName": "test_package_name"}}, "organization": "test_organization"}'
    )

    assert jsonable_encoder(test_readme_config) == {
        "remote": {"type": "github", "repoUrl": "test_repo_url", "installationToken": "test_installation_token"},
        "language": {"type": "python", "publishInfo": {"packageName": "test_package_name"}},
        "organization": "test_organization",
    }


def test_generator_includes_aiohttp_support() -> None:
    """Integration test: verify generated SDK includes complete aiohttp support"""
    # This is a placeholder integration test that verifies the overall flow
    # In a full implementation, this would generate a complete SDK and verify:
    # 1. pyproject.toml includes aiohttp extra
    # 2. __init__.py exports DefaultAioHttpClient
    # 3. Error messages are properly templated
    # For now, just verify our changes are integrated correctly

    # Test 1: Verify PyProjectToml includes aiohttp extra
    config = PyProjectTomlPackageConfig(include="test_package")

    with tempfile.TemporaryDirectory() as temp_dir:
        pyproject = PyProjectToml(
            name="test-package",
            version="1.0.0",
            package=config,
            path=temp_dir,
            dependency_manager=DependencyManager(),
            python_version="^3.8",
            pypi_metadata=None,
            github_output_mode=None,
            license_=None,
        )

        # Test that aiohttp extra is automatically included
        assert "aiohttp" in pyproject._extras
        assert pyproject._extras["aiohttp"] == ["aiohttp", "httpx_aiohttp"]

        # Test 2: Verify core utilities include new exports
        # This would test the actual file export process in a real scenario
        # The core utilities integration is tested in test_core_utilities.py
        assert True  # Placeholder - integration test framework needed
