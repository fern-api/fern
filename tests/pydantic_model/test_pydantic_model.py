import os
from glob import glob
from pathlib import Path
from typing import List

from snapshottest.file import FileSnapshot  # type: ignore
from snapshottest.module import SnapshotTest  # type: ignore

from fern_python.cli import main as cli
from fern_python.generated import generator_exec


def test_pydantic_model(snapshot: SnapshotTest, tmpdir: Path) -> None:
    filepath = os.getenv("PYTEST_CURRENT_TEST")
    if filepath is None:
        raise RuntimeError("PYTEST_CURRENT_TEST is not defined")

    path_to_fixture = os.path.join(os.path.dirname(filepath), "fixtures/fern-ir")

    path_to_config_json = os.path.join(tmpdir, "config.json")
    path_to_output = os.path.join(tmpdir, "output/")

    config = generator_exec.config.GeneratorConfig(
        ir_filepath=os.path.join(path_to_fixture, "ir.json"),
        output=generator_exec.config.GeneratorOutputConfig(path=path_to_output),
        workspace_name="ir",
        organization="fern",
        custom_config=None,
        environment=generator_exec.config.GeneratorEnvironment.local(),
    )

    with open(path_to_config_json, "w") as f:
        f.write(config.json(by_alias=True))

    cli(path_to_config_json)

    written_filepaths = glob(os.path.join(path_to_output, "**/*.py"), recursive=True)

    relative_filepaths: List[str] = []
    for written_filepath in written_filepaths:
        relative_filepath = os.path.relpath(written_filepath, start=path_to_output)

        # don't use a .py extension. if we do, then the snapshots have .py
        # extensions, and pytest tries to run them.
        new_filepath = written_filepath.replace(".py", "")
        os.rename(written_filepath, new_filepath)

        snapshot.assert_match(
            name=relative_filepath.replace("/", "_").replace(".py", ""), value=FileSnapshot(new_filepath)
        )

    snapshot.assert_match(
        name="filepaths",
        value=relative_filepaths,
    )
