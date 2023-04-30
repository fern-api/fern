from pathlib import Path

from fern.generator_exec.resources import config
from snapshottest.module import SnapshotTest  # type: ignore

from fern_python.generators.pydantic_model.cli import main as cli

from ..snapshot_helpers import run_snapshot_test


def test_pydantic_model(snapshot: SnapshotTest, tmpdir: Path) -> None:
    run_snapshot_test(
        snapshot=snapshot,
        fixture_name="trace",
        tmpdir=tmpdir,
        cli=cli,
        filename_of_test=__file__,
        custom_config={"include_validators": True},
    )


def test_publish_pydantic_model(snapshot: SnapshotTest, tmpdir: Path) -> None:
    run_snapshot_test(
        snapshot=snapshot,
        fixture_name="imdb-publish",
        tmpdir=tmpdir,
        cli=cli,
        filename_of_test=__file__,
        custom_config={"include_validators": True},
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
