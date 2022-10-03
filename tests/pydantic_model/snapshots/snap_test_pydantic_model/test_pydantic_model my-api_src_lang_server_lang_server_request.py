import typing

import pydantic


class LangServerRequest(pydantic.BaseModel):
    request: typing.Optional
