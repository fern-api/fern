import typing

import pydantic

from .string_with_all_casings import StringWithAllCasings


class FernFilepath(pydantic.BaseModel):
    __root__: typing.List[StringWithAllCasings]

    def get_value(self) -> typing.List[StringWithAllCasings]:
        return self.__root__

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
