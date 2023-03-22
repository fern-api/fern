from pathlib import Path

from snapshottest.module import SnapshotTest  # type: ignore

from fern_python.generators.fastapi.cli import main as cli

from ..snapshot_helpers import run_snapshot_test


def test_fastapi(snapshot: SnapshotTest, tmpdir: Path) -> None:
    run_snapshot_test(
        snapshot=snapshot,
        fixture_name="trace",
        tmpdir=tmpdir,
        cli=cli,
        filename_of_test=__file__,
        custom_config={"include_validators": True, "include_union_visitors": True},
    )


def test_fastapi_error_status_code(snapshot: SnapshotTest, tmpdir: Path) -> None:
    run_snapshot_test(
        snapshot=snapshot,
        fixture_name="imdb",
        tmpdir=tmpdir,
        cli=cli,
        filename_of_test=__file__,
        custom_config={"include_validators": True, "include_union_visitors": True},
    )
