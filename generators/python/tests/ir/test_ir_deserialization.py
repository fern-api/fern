import os
import subprocess
import sys

from fern.ir import IntermediateRepresentation

sys.setrecursionlimit(2000)


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
