from pathlib import Path

from snapshottest.module import SnapshotTest  # type: ignore

from fern_python.generators.fastapi.cli import main as cli

from ..snapshot_helpers import run_snapshot_test


def test_fastapi(snapshot: SnapshotTest, tmpdir: Path) -> None:
    run_snapshot_test(snapshot=snapshot, fixture_name="trace", tmpdir=tmpdir, cli=cli, filename_of_test=__file__)
