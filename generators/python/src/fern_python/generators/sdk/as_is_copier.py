import os
from fern_python.codegen.filepath import Filepath
from fern_python.codegen.project import Project
from fern_python.source_file_factory.source_file_factory import SourceFileFactory
from pydantic import BaseModel


class AsIsFile(BaseModel):
    from_: str
    to: str

# Add more files you need to copy as is
# This file is really to simplify the process of copying, leaving core utilities for files
# that need to be referenced within the project, and more complex cases.
AS_IS_FILES = [
    AsIsFile(from_="tests/utils/test_query_encoding.py", to="tests/utils/test_query_encoding.py"),
    AsIsFile(from_="tests/utils/test_http_client.py", to="tests/utils/test_http_client.py"),
]


def copy_to_project(*, project: Project) -> None:
    for f in AS_IS_FILES:
        _copy_file_to_project(
            project=project,
            relative_filepath_on_disk=f.from_,
            filepath_in_project=Filepath(
                directories=(),
                file=Filepath.FilepathPart(module_name=f.to),
            ),
        )

def _copy_file_to_project(
    *, project: Project, relative_filepath_on_disk: str, filepath_in_project: Filepath
) -> None:
    # Project root source, so all from_ requests should be relative to that
    source = (
        os.path.join(os.path.dirname(__file__), "../../../../../")
        if "PYTEST_CURRENT_TEST" in os.environ
        else "/assets"
    )
    SourceFileFactory.add_source_file_from_disk(
        project=project,
        path_on_disk=os.path.join(source, relative_filepath_on_disk),
        filepath_in_project=filepath_in_project,
        exports=set(),
        include_src_root=False,
    )
