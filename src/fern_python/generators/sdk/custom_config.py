from typing import Literal, Optional, Union

import pydantic

from fern_python.generators.pydantic_model import PydanticModelCustomConfig


class SdkPydanticModelCustomConfig(PydanticModelCustomConfig):
    frozen: bool = True
    orm_mode: bool = False
    smart_union: bool = True
    include_union_utils: bool = False
    wrapped_aliases: bool = False


class SDKCustomConfig(pydantic.BaseModel):
    skip_formatting: bool = False
    client_class_name: Optional[str] = None
    client_filename: str = "client.py"
    include_union_utils: bool = False
    use_api_name_in_package: bool = False
    package_name: Optional[str] = None
    timeout_in_seconds: Union[Literal["infinity"], int] = 60
    flat_layout: bool = False
    pydantic_config: SdkPydanticModelCustomConfig = SdkPydanticModelCustomConfig()

    class Config:
        extra = pydantic.Extra.forbid
