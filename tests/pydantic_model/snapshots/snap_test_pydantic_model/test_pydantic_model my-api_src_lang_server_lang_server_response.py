import typing

import pydantic


class LangServerResponse(pydantic.BaseModel):
    response: typing.Any

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
