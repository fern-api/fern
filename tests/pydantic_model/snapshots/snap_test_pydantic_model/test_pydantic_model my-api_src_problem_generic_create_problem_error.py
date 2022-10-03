import typing

import pydantic


class GenericCreateProblemError(pydantic.BaseModel):
    message: str
    type: str
    stacktrace: str

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
