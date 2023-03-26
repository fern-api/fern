from typing import Optional

import pydantic


class SDKCustomConfig(pydantic.BaseModel):
    wrapped_aliases: bool = False
    skip_formatting: bool = False
    client_class_name: Optional[str] = None
    include_union_utils: bool = False
