from typing import Any, Dict, List, Literal, Optional, Union

import pydantic
from fern_python.codegen.module_manager import ModuleExport
from fern_python.generators.pydantic_model import PydanticModelCustomConfig


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
    pyproject_python_version: Optional[str] = "^3.8"

    # Whether or not to generate TypedDicts instead of Pydantic
    # Models for request objects.
    use_typeddict_requests: bool = False

    class Config:
        extra = pydantic.Extra.forbid

    @classmethod
    def parse_obj(cls, obj: Any) -> "SDKCustomConfig":
        obj = super().parse_obj(obj)

        use_typeddict_requests = obj.use_typeddict_requests or obj.pydantic_config.use_typeddict_requests
        obj.use_typeddict_requests = use_typeddict_requests
        obj.pydantic_config.use_typeddict_requests = use_typeddict_requests

        return obj
