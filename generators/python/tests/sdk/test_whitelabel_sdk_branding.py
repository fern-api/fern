from pathlib import Path
from typing import Optional

import fern.ir.resources as ir_types
import pytest

from fern_python.codegen import AST
from fern_python.codegen.project import Project, ProjectConfig
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ClientWrapperGenerator,
    get_platform_header_name,
)
from fern_python.generators.sdk.core_utilities.core_utilities import get_whitelabel_logger_name
from fern_python.generators.sdk.custom_config import SDKCustomConfig
from fern_python.source_file_factory import SourceFileFactory

CORE_LOGGING_PY = Path(__file__).parents[2] / "core_utilities" / "shared" / "logging.py"


class _FakeIr:
    def __init__(self) -> None:
        self.auth = ir_types.ApiAuth(requirement=ir_types.AuthSchemesRequirement.ALL, schemes=[])
        self.sdk_config = ir_types.SdkConfig(
            is_auth_mandatory=False,
            has_streaming_endpoints=False,
            has_paginated_endpoints=False,
            has_file_download_endpoints=False,
            platform_headers=ir_types.PlatformHeaders(
                language="X-Fern-Language",
                sdk_name="X-Fern-SDK-Name",
                sdk_version="X-Fern-SDK-Version",
            ),
        )


class _FakeContext:
    def __init__(self) -> None:
        self.ir = _FakeIr()
        self.custom_config = SDKCustomConfig.parse_obj({})


class _FakeProject:
    def __init__(self, *, whitelabel: bool) -> None:
        self._project_config: Optional[ProjectConfig] = ProjectConfig(package_name="acme", package_version="1.2.3")
        self.whitelabel = whitelabel


def _get_headers_body(*, whitelabel: bool) -> str:
    generator = ClientWrapperGenerator(context=_FakeContext(), generated_environment=None)  # type: ignore[arg-type]
    snippet = SourceFileFactory(should_format=False).create_snippet()
    snippet.add_arbitrary_code(
        AST.CodeWriter(
            generator._get_write_get_headers_body(
                constructor_parameters=[],
                literal_headers=[],
                project=_FakeProject(whitelabel=whitelabel),  # type: ignore[arg-type]
            )
        )
    )
    return snippet.to_str()


@pytest.mark.parametrize("suffix", ["Language", "Runtime", "Platform", "SDK-Name", "SDK-Version"])
def test_whitelabel_renames_platform_headers(suffix: str) -> None:
    body = _get_headers_body(whitelabel=True)
    assert f"X-Codegen-{suffix}" in body
    assert "X-Fern-" not in body


@pytest.mark.parametrize("suffix", ["Language", "Runtime", "Platform", "SDK-Name", "SDK-Version"])
def test_default_keeps_fern_platform_headers(suffix: str) -> None:
    body = _get_headers_body(whitelabel=False)
    assert f"X-Fern-{suffix}" in body
    assert "X-Codegen-" not in body


def test_platform_header_name_only_rewrites_fern_prefix() -> None:
    assert get_platform_header_name("X-Fern-Language", whitelabel=True) == "X-Codegen-Language"
    assert get_platform_header_name("X-Custom-Language", whitelabel=True) == "X-Custom-Language"
    assert get_platform_header_name("X-Fern-Language", whitelabel=False) == "X-Fern-Language"


def _project(tmp_path: Path, *, project_config: Optional[ProjectConfig]) -> Project:
    return Project(
        filepath=str(tmp_path),
        relative_path_to_project="acme",
        project_config=project_config,
        whitelabel=True,
        pypi_metadata=None,
        github_output_mode=None,
        license_=None,
    )


def test_whitelabel_logger_name_is_package_name(tmp_path: Path) -> None:
    project = _project(tmp_path, project_config=ProjectConfig(package_name="acme-sdk", package_version="1.2.3"))
    assert get_whitelabel_logger_name(project) == "acme-sdk"


def test_whitelabel_logger_name_without_project_config(tmp_path: Path) -> None:
    assert get_whitelabel_logger_name(_project(tmp_path, project_config=None)) == "acme"


def test_core_logging_still_names_logger_fern() -> None:
    # CoreUtilities rewrites this exact string for whitelabeled SDKs.
    assert CORE_LOGGING_PY.read_text().count('logging.getLogger("fern")') == 1
