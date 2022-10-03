import typing

import pydantic


class GetTraceResponsesPageRequest(pydantic.BaseModel):
    offset: typing.Optional[int]
