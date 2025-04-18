from generatorcli import LanguageInfo_Python, PypiPublishInfo, ReadmeConfig, Remote

import json

from core_utilities.shared.jsonable_encoder import jsonable_encoder


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
