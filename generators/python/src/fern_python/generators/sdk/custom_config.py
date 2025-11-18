from typing import Any, Dict, List, Literal, Optional, Union, cast

import pydantic
from fern_python.codegen.module_manager import ModuleExport
from fern_python.generators.pydantic_model.custom_config import PydanticModelCustomConfig


class SdkPydanticModelCustomConfig(PydanticModelCustomConfig):
    frozen: bool = True
    orm_mode: bool = False
    smart_union: bool = True
    include_union_utils: bool = False
    require_optional_fields: bool = False
    use_pydantic_field_aliases: bool = False


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


class BaseDependencyCustomConfig(pydantic.BaseModel):
    version: str
    extras: Optional[List[str]] = None


class DependencyCustomConfig(BaseDependencyCustomConfig):
    python: Optional[str] = None
    optional: bool = False


class CustomReadmeSection(pydantic.BaseModel):
    title: str
    content: str


class SDKCustomConfig(pydantic.BaseModel):
    extra_dependencies: Dict[str, Union[str, DependencyCustomConfig]] = {}
    extra_dev_dependencies: Dict[str, Union[str, BaseDependencyCustomConfig]] = {}
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
    exclude_types_from_init_exports: Optional[bool] = False
    custom_readme_sections: Optional[List[CustomReadmeSection]] = None
    # Feature flag that improves imports in the
    # Python SDK by removing nested `resources` directory
    improved_imports: bool = True

    follow_redirects_by_default: Optional[bool] = True

    # Feature flag that removes the usage of request objects, and instead
    # parameters in function signatures where possible.
    inline_request_params: bool = True

    # If true, treats path parameters as named parameters in endpoint functions
    inline_path_params: bool = False

    # Feature flag that enables generation of Python websocket clients
    should_generate_websocket_clients: bool = False

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

    # Whether or not to generate TypedDicts instead of Pydantic
    # Models for file upload request objects.
    #
    # Note that this flag was only introduced due to an oversight in
    # the `use_typeddict_requests` flag implementation; it should be
    # removed in the future.
    use_typeddict_requests_for_file_upload: bool = False

    use_inheritance_for_extended_models: bool = True
    """
    Whether to generate Pydantic models that implement inheritance when a model utilizes the Fern `extends` keyword.
    """

    pyproject_toml: Optional[str] = None

    # The chunk size to use (if any) when processing a response bytes stream within `iter_bytes` or `aiter_bytes`
    # results in: `for _chunk in _response.iter_bytes(chunk_size=<default_bytes_stream_chunk_size>):`
    default_bytes_stream_chunk_size: Optional[int] = None

    # Whether or not to include legacy wire tests in the generated SDK.
    include_legacy_wire_tests: bool = False

    # Whether to lazy import the generated classes based on usage.
    # This is useful for large SDKs where the majority of the classes are not used.
    # It also improves the performance of an initial import of the SDK, at the cost of some latency during first use.
    lazy_imports: bool = True

    # The recursion limit to set for the SDK. Must be greater than 1000 (the default recursion limit in Python).
    # If set, the root __init__.py will include sys.setrecursionlimit() to ensure
    # the recursion limit is at least this value.
    recursion_limit: Optional[int] = pydantic.Field(None, gt=1000)

    custom_pager_name: Optional[str] = pydantic.Field(None, alias="custom-pager-name")

    class Config:
        extra = pydantic.Extra.forbid
        allow_population_by_field_name = True

    @classmethod
    def parse_obj(cls, obj: Any) -> "SDKCustomConfig":
        obj = super().parse_obj(obj)

        use_typeddict_requests = obj.use_typeddict_requests or obj.pydantic_config.use_typeddict_requests
        obj.use_typeddict_requests = use_typeddict_requests
        obj.pydantic_config.use_typeddict_requests = use_typeddict_requests

        return cast(SDKCustomConfig, obj)

    @pydantic.model_validator(mode="after")
    def propagate_use_inheritance_for_extended_models(self) -> "SDKCustomConfig":
        self.pydantic_config.use_inheritance_for_extended_models = self.use_inheritance_for_extended_models
        return self
