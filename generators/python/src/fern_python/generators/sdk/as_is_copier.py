import os
from typing import Dict, Literal, Optional

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


LEGACY_RETRYABLE_STATUS_CODES = [408, 409, 429, 500, 501, 502, 503, 504, 599]
LEGACY_NON_RETRYABLE_STATUS_CODES = [200, 201, 301, 400, 401, 403, 404]
RECOMMENDED_RETRYABLE_STATUS_CODES = [408, 409, 429, 502, 503, 504]
RECOMMENDED_NON_RETRYABLE_STATUS_CODES = [200, 201, 301, 400, 401, 403, 404, 500, 501, 599]


def copy_to_project(*, project: Project, retry_status_codes: Literal["legacy", "recommended"] = "legacy") -> None:
    # Add more files you need to copy as is
    # This file is really to simplify the process of copying, leaving core utilities for files
    # that need to be referenced within the project, and more complex cases.

    # Use the full module path including package_path for import replacements
    module_path = project.get_module_path_for_imports()

    retryable_status_codes, non_retryable_status_codes = (
        (RECOMMENDED_RETRYABLE_STATUS_CODES, RECOMMENDED_NON_RETRYABLE_STATUS_CODES)
        if retry_status_codes == "recommended"
        else (LEGACY_RETRYABLE_STATUS_CODES, LEGACY_NON_RETRYABLE_STATUS_CODES)
    )
    http_client_test = "tests/utils/test_http_client.py"
    retryable_placeholder = _find_marker_line(http_client_test, "RETRYABLE_STATUS_CODES")
    non_retryable_placeholder = _find_marker_line(http_client_test, "NON_RETRYABLE_STATUS_CODES")

    AS_IS_FILES = [
        AsIsFile(
            from_="tests/utils/__init__.py",
            to="tests/utils/__init__",
        ),
        AsIsFile(
            from_="tests/utils/test_query_encoding.py",
            to="tests/utils/test_query_encoding",
            replacements={
                "core_utilities.shared.query_encoder": f"{module_path}.core.query_encoder",
            },
        ),
        AsIsFile(
            from_=http_client_test,
            to="tests/utils/test_http_client",
            replacements={
                "core_utilities.shared.request_options": f"{module_path}.core.request_options",
                "core_utilities.shared.http_client": f"{module_path}.core.http_client",
                retryable_placeholder: f"RETRYABLE_STATUS_CODES = {retryable_status_codes}",
                non_retryable_placeholder: f"NON_RETRYABLE_STATUS_CODES = {non_retryable_status_codes}",
            },
        ),
        AsIsFile(
            from_="tests/utils/test_serialization.py",
            to="tests/utils/test_serialization",
            replacements={
                ".typeddict_models.types.core.serialization": f"{module_path}.core.serialization",
                ".typeddict_models.types": ".assets.models",
            },
        ),
        AsIsFile(
            from_="tests/utils/typeddict_models/types/resources/types/color.py",
            to="tests/utils/assets/models/color",
            replacements={
                ".typeddict_models.types.core.serialization": f"{module_path}.core.serialization",
                ".typeddict_models.types": ".assets.models",
            },
        ),
    ]

    AS_IS_DIRECTORIES = [
        AsIsFile(
            from_="tests/utils/typeddict_models/types/resources/types/requests",
            to="tests/utils/assets/models",
            replacements={
                "....core.serialization": f"{module_path}.core.serialization",
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


def _assets_root() -> str:
    return os.environ.get(
        "FERN_ASSETS_PATH",
        os.path.join(os.path.dirname(__file__), "../../../../../")
        if "PYTEST_CURRENT_TEST" in os.environ
        else "/assets",
    )


def _find_marker_line(relative_filepath_on_disk: str, marker: str) -> str:
    """Return the single source line tagged with `# {{marker}}` so it can be used as a replacement key."""
    tag = f"# {{{{{marker}}}}}"
    with open(os.path.join(_assets_root(), relative_filepath_on_disk), "r") as f:
        matches = [line for line in f.read().splitlines() if line.rstrip().endswith(tag)]
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected exactly one line tagged {tag} in {relative_filepath_on_disk}, found {len(matches)}"
        )
    return matches[0]


def _copy_directory_to_project(
    *,
    project: Project,
    relative_path_on_disk: str,
    path_in_project: str,
    replacements: Optional[Dict[str, str]] = None,
) -> None:
    source = _assets_root()

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
    source = _assets_root()
    SourceFileFactory.add_source_file_from_disk(
        project=project,
        path_on_disk=os.path.join(source, relative_filepath_on_disk),
        filepath_in_project=filepath_in_project,
        exports=set(),
        include_src_root=False,
        string_replacements=replacements,
    )
