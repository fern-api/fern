import os
import subprocess

from fern.ir import IntermediateRepresentation


def test_ir_deserialization() -> None:
    path_to_ir = os.path.join(os.path.dirname(__file__), "fixtures/fern/ir.json")
    subprocess.run(
        [
            "npx",
            "--yes",
            "fern-api",
            "ir",
            path_to_ir,
            "--language",
            "python",
        ],
        cwd=os.path.join(
            os.path.dirname(__file__),
            "fixtures",
        ),
        check=True,
    )

    IntermediateRepresentation.parse_file(path_to_ir)
