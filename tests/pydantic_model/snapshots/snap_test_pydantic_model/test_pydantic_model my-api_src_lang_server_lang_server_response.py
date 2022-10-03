import typing

import pydantic


class LangServerResponse(pydantic.BaseModel):
    response: typing.Optional
