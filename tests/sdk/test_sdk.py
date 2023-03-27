from pathlib import Path

from fern.generator_exec.sdk.resources import config
from snapshottest.module import SnapshotTest  # type: ignore

from fern_python.generators.sdk.cli import main as cli

from ..snapshot_helpers import run_snapshot_test


def test_trace_sdk(snapshot: SnapshotTest, tmpdir: Path) -> None:
    run_snapshot_test(snapshot=snapshot, fixture_name="trace", tmpdir=tmpdir, cli=cli, filename_of_test=__file__)


def test_publish_sdk(snapshot: SnapshotTest, tmpdir: Path) -> None:
    run_snapshot_test(
        snapshot=snapshot,
        fixture_name="imdb-publish",
        tmpdir=tmpdir,
        cli=cli,
        filename_of_test=__file__,
        output_mode=config.OutputMode.factory.publish(
            config.GeneratorPublishConfig(
                registries=config.GeneratorRegistriesConfig(
                    maven=config.MavenRegistryConfig(
                        registry_url="",
                        username="",
                        password="",
                        group="",
                    ),
                    npm=config.NpmRegistryConfig(
                        registry_url="",
                        token="",
                        scope="",
                    ),
                ),
                registries_v_2=config.GeneratorRegistriesConfigV2(
                    maven=config.MavenRegistryConfigV2(
                        registry_url="",
                        username="",
                        password="",
                        coordinate="",
                    ),
                    npm=config.NpmRegistryConfigV2(
                        registry_url="",
                        token="",
                        package_name="",
                    ),
                    pypi=config.PypiRegistryConfig(
                        registry_url="www.some-pypi.com",
                        username="username",
                        password="password",
                        package_name="my-package-name",
                    ),
                ),
                publish_target=config.GeneratorPublishTarget.factory.pypi(
                    config.PypiRegistryConfig(
                        registry_url="www.some-pypi.com",
                        username="username",
                        password="password",
                        package_name="my-package-name",
                    )
                ),
                version="1.0.0",
            )
        ),
    )


def test_github_sdk(snapshot: SnapshotTest, tmpdir: Path) -> None:
    run_snapshot_test(
        snapshot=snapshot,
        fixture_name="imdb-github",
        tmpdir=tmpdir,
        cli=cli,
        filename_of_test=__file__,
        output_mode=config.OutputMode.factory.github(
            config.GithubOutputMode(
                repo_url="some-repo-url",
                version="1.0.0",
                publish_info=config.GithubPublishInfo.factory.pypi(
                    config.PypiGithubPublishInfo(
                        registry_url="https://pypi.org/",
                        package_name="my-package-name",
                        username_environment_variable="PYPI_USERNAME",
                        password_environment_variable="PYPI_PASSWORD",
                    )
                ),
            ),
        ),
    )
