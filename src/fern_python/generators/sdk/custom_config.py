from typing import Literal, Optional, Union

import pydantic


class SDKCustomConfig(pydantic.BaseModel):
    wrapped_aliases: bool = False
    skip_formatting: bool = False
    client_class_name: Optional[str] = None
    include_union_utils: bool = False
    use_api_name_in_package: bool = False
    timeout_in_seconds: Union[Literal["infinity"], int] = 60
