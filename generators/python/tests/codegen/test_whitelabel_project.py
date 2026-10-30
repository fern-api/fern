import os
from pathlib import Path

import pytest

from fern_python.codegen import AST
from fern_python.codegen.filepath import Filepath
from fern_python.codegen.project import Project

CORE_UTILITIES = Path(__file__).parents[2] / "core_utilities" / "shared"


def _generate(tmp_path: Path, *, whitelabel: bool) -> dict[str, str]:
    project = Project(
        filepath=str(tmp_path),
        relative_path_to_project="seed",
        whitelabel=whitelabel,
        pypi_metadata=None,
        github_output_mode=None,
        license_=None,
    )
    core = (Filepath.DirectoryFilepathPart(module_name="core"),)
    for module_name in ("stream", "datetime_utils"):
        project.add_source_file_from_disk(
            path_on_disk=str(CORE_UTILITIES / f"{module_name}.py"),
            filepath_in_project=Filepath(directories=core, file=Filepath.FilepathPart(module_name=module_name)),
            exports=set(),
        )
    filepath = Filepath(directories=(), file=Filepath.FilepathPart(module_name="client"))
    source_file = project.source_file(filepath)
    source_file.add_class_declaration(AST.ClassDeclaration(name="Client"))
    project.write_source_file(source_file=source_file, filepath=filepath)
    project.add_file(
        project.get_source_file_filepath(
            Filepath(directories=(), file=Filepath.FilepathPart(module_name="_default_clients")), include_src_root=True
        ),
        f"{project.auto_generated_comment}\n",
    )
    project.finish()

    files = {}
    for root, _, names in os.walk(tmp_path):
        for name in names:
            if name.endswith(".py"):
                path = Path(root) / name
                files[str(path.relative_to(tmp_path))] = path.read_text()
    return files


@pytest.mark.parametrize("whitelabel", [True, False])
def test_every_python_file_gets_the_configured_header(tmp_path: Path, whitelabel: bool) -> None:
    files = _generate(tmp_path, whitelabel=whitelabel)
    assert {"__init__.py", "core/__init__.py", "core/stream.py", "client.py", "_default_clients.py"} <= set(files)
    for name, contents in files.items():
        assert contents.startswith("# This file was auto-generated"), name
        assert ("by Fern" in contents) is not whitelabel, name
