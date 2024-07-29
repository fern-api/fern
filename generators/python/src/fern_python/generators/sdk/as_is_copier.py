import os
from typing import Dict, Optional

from fern_python.codegen.filepath import Filepath
from fern_python.codegen.project import Project
from fern_python.source_file_factory.source_file_factory import SourceFileFactory
from pydantic import BaseModel


class ImportUpdate(BaseModel):
    from_: str
    to: str


class AsIsFile(BaseModel):
    from_: str
    to: str
    replacements: Optional[Dict[str, str]] = None


def copy_to_project(*, project: Project) -> None:
    # Add more files you need to copy as is
    # This file is really to simplify the process of copying, leaving core utilities for files
    # that need to be referenced within the project, and more complex cases.
    AS_IS_FILES = [
        AsIsFile(
            from_="tests/utils/__init__.py",
            to="tests/utils/__init__",
        ),
        AsIsFile(
            from_="tests/utils/test_query_encoding.py",
            to="tests/utils/test_query_encoding",
            replacements={
                "core_utilities.sdk.query_encoder": f"{project._relative_path_to_project}.core.query_encoder",
            },
        ),
        AsIsFile(
            from_="tests/utils/test_http_client.py",
            to="tests/utils/test_http_client",
            replacements={
                "core_utilities.sdk.request_options": f"{project._relative_path_to_project}.core.request_options",
                "core_utilities.sdk.http_client": f"{project._relative_path_to_project}.core.http_client",
            },
        ),
        AsIsFile(
            from_="tests/utils/test_serialization.py",
            to="tests/utils/test_serialization",
            replacements={
                ".typeddict_models.types.core.serialization": f"{project._relative_path_to_project}.core.serialization",
                ".typeddict_models.types": f".assets.models",
            },
        ),
        AsIsFile(
            from_="tests/utils/typeddict_models/types/resources/types/color.py",
            to="tests/utils/assets/models/color",
            replacements={
                ".typeddict_models.types.core.serialization": f"{project._relative_path_to_project}.core.serialization",
                ".typeddict_models.types": f".assets.models",
            },
        ),
    ]

    AS_IS_DIRECTORIES = [
        AsIsFile(
            from_="tests/utils/typeddict_models/types/resources/types/requests",
            to="tests/utils/assets/models",
            replacements={
                "....core.serialization": f"{project._relative_path_to_project}.core.serialization",
                "..color": ".color",
            },
        ),
    ]

    for f in AS_IS_DIRECTORIES:
        _copy_directory_to_project(
            project=project,
            relative_path_on_disk=f.from_,
            path_in_project=f.to,
            replacements=f.replacements,
        )

    for f in AS_IS_FILES:
        _copy_file_to_project(
            project=project,
            relative_filepath_on_disk=f.from_,
            filepath_in_project=Filepath(
                directories=(),
                file=Filepath.FilepathPart(module_name=f.to),
            ),
            replacements=f.replacements,
        )


def _copy_directory_to_project(
    *,
    project: Project,
    relative_path_on_disk: str,
    path_in_project: str,
    replacements: Optional[Dict[str, str]] = None,
) -> None:
    source = (
        os.path.join(os.path.dirname(__file__), "../../../../../") if "PYTEST_CURRENT_TEST" in os.environ else "/assets"
    )

    for _, _, files in os.walk(os.path.join(source, relative_path_on_disk)):
        for f in files:
            # In the event there are any odd hidden files while traversing
            if f.endswith(".py"):
                _copy_file_to_project(
                    project=project,
                    relative_filepath_on_disk=os.path.join(source, relative_path_on_disk, f),
                    filepath_in_project=Filepath(
                        directories=(),
                        # Remove the .py extension from the filename
                        file=Filepath.FilepathPart(module_name=os.path.join(path_in_project, f[:-3])),
                    ),
                    replacements=replacements,
                )


def _copy_file_to_project(
    *,
    project: Project,
    relative_filepath_on_disk: str,
    filepath_in_project: Filepath,
    replacements: Optional[Dict[str, str]] = None,
) -> None:
    # Project root source, so all from_ requests should be relative to that
    source = (
        os.path.join(os.path.dirname(__file__), "../../../../../") if "PYTEST_CURRENT_TEST" in os.environ else "/assets"
    )
    SourceFileFactory.add_source_file_from_disk(
        project=project,
        path_on_disk=os.path.join(source, relative_filepath_on_disk),
        filepath_in_project=filepath_in_project,
        exports=set(),
        include_src_root=False,
        string_replacements=replacements,
    )
