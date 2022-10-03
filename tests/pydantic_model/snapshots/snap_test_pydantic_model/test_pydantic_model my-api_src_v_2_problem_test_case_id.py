import typing

import pydantic


class TestCaseId(pydantic.BaseModel):
    __root__: str

    def get_value(self) -> str:
        return self.__root__

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
