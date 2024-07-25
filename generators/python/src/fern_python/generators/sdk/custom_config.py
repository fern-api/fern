from typing import Dict, List, Literal, Optional, Union

import pydantic
from poetry.core.constraints.version import Version

from fern_python.codegen.module_manager import ModuleExport
from fern_python.generators.pydantic_model import PydanticModelCustomConfig

DEFAULT_PYTHON_VERSION_CONSTRAINT = "^3.8"

ALLOWED_PYTHON_VERSIONS = [
    Version.from_parts(major=3, minor=8),
    Version.from_parts(major=3, minor=9),
    Version.from_parts(major=3, minor=10),
    Version.from_parts(major=3, minor=11),
    Version.from_parts(major=3, minor=12),
    Version.from_parts(major=3, minor=13),
]
class SdkPydanticModelCustomConfig(PydanticModelCustomConfig):
    frozen: bool = True
    orm_mode: bool = False
    smart_union: bool = True
    include_union_utils: bool = False
    require_optional_fields: bool = False


class ClientConfiguration(pydantic.BaseModel):
    # The filename where the auto-generated client
    # lives
    filename: str = "client.py"
    class_name: Optional[str] = None
    # The filename of the exported client which
    # will be used in code snippets
    exported_filename: str = "client.py"
    exported_class_name: Optional[str] = None

    class Config:
        extra = pydantic.Extra.forbid


class DependencyCusomConfig(pydantic.BaseModel):
    version: str
    optional: bool


class SDKCustomConfig(pydantic.BaseModel):
    extra_dependencies: Dict[str, Union[str, DependencyCusomConfig]] = {}
    extra_dev_dependencies: Dict[str, str] = {}
    extras: Dict[str, List[str]] = {}
    skip_formatting: bool = False
    client: ClientConfiguration = ClientConfiguration()
    include_union_utils: bool = False
    use_api_name_in_package: bool = False
    package_name: Optional[str] = None
    timeout_in_seconds: Union[Literal["infinity"], int] = 60
    flat_layout: bool = False
    pydantic_config: SdkPydanticModelCustomConfig = SdkPydanticModelCustomConfig()
    additional_init_exports: Optional[List[ModuleExport]] = None
    # Feature flag that improves imports in the
    # Python SDK by removing nested `resources` directoy
    improved_imports: bool = True

    follow_redirects_by_default: Optional[bool] = True

    # Feature flag that removes the usage of request objects, and instead
    # parameters in function signatures where possible.
    inline_request_params: bool = True

    # deprecated, use client config instead
    client_class_name: Optional[str] = None
    # deprecated, use client config instead
    client_filename: Optional[str] = None

    # WARNING - this changes your declared python dependency, which is not meant to
    # be done often if at all. This is a last resort if any dependencies force you
    # to change your version requirements.
    pyproject_python_version: Optional[str] = DEFAULT_PYTHON_VERSION_CONSTRAINT

    class Config:
        extra = pydantic.Extra.forbid
