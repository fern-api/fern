import pydantic
import typing
from abc import ABC, abstractmethod
import typing_extensions
from ..commons import WithDocs

_Result = typing.TypeVar("_Result")


class Type(pydantic.BaseModel):
    class Alias(WithDocs):
        type: typing.Literal["alias"] = pydantic.Field(alias="_type")

    class Enum(WithDocs):
        type: typing.Literal["enum"] = pydantic.Field(alias="_type")

    class Object(WithDocs):
        type: typing.Literal["object"] = pydantic.Field(alias="_type")

    class Union(WithDocs):
        type: typing.Literal["union"] = pydantic.Field(alias="_type")

    __root__: typing_extensions.Annotated[
        typing.Union[Alias, Enum, Object, Union],
        # underscore prefix broken with _type
        # https://github.com/pydantic/pydantic/issues/3849#issuecomment-1231445845
        pydantic.Field(discriminator="type"),
    ]

    class _Visitor(ABC, typing.Generic[_Result]):
        @abstractmethod
        def alias(self) -> _Result:
            ...

        @abstractmethod
        def enum(self) -> _Result:
            ...

        @abstractmethod
        def object(self) -> _Result:
            ...

        @abstractmethod
        def union(self) -> _Result:
            ...

    def _visit(self, visitor: _Visitor[_Result]) -> None:
        print(self.__root__.type)
