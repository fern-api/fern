# This file was auto-generated by Fern from our API Definition.

from __future__ import annotations
from ....core.pydantic_utilities import IS_PYDANTIC_V2
import typing
from ....core.pydantic_utilities import UniversalRootModel
import typing_extensions
import pydantic
from ....core.pydantic_utilities import UniversalBaseModel
from ....core.pydantic_utilities import update_forward_refs
T_Result = typing.TypeVar("T_Result")
class _Factory:
    
    def custom_name(self, value: str) -> DiscriminatedLiteral:
        if IS_PYDANTIC_V2:
            return DiscriminatedLiteral(root=_DiscriminatedLiteral.CustomName(type="customName", value=value))  # type: ignore
        else:
            return DiscriminatedLiteral(__root__=_DiscriminatedLiteral.CustomName(type="customName", value=value))  # type: ignore
    
    def default_name(self, value: typing.Literal["Bob"]) -> DiscriminatedLiteral:
        if IS_PYDANTIC_V2:
            return DiscriminatedLiteral(root=_DiscriminatedLiteral.DefaultName(type="defaultName", value=value))  # type: ignore
        else:
            return DiscriminatedLiteral(__root__=_DiscriminatedLiteral.DefaultName(type="defaultName", value=value))  # type: ignore
    
    def george(self, value: bool) -> DiscriminatedLiteral:
        if IS_PYDANTIC_V2:
            return DiscriminatedLiteral(root=_DiscriminatedLiteral.George(type="george", value=value))  # type: ignore
        else:
            return DiscriminatedLiteral(__root__=_DiscriminatedLiteral.George(type="george", value=value))  # type: ignore
    
    def literal_george(self, value: typing.Literal[True]) -> DiscriminatedLiteral:
        if IS_PYDANTIC_V2:
            return DiscriminatedLiteral(root=_DiscriminatedLiteral.LiteralGeorge(type="literalGeorge", value=value))  # type: ignore
        else:
            return DiscriminatedLiteral(__root__=_DiscriminatedLiteral.LiteralGeorge(type="literalGeorge", value=value))  # type: ignore
class DiscriminatedLiteral(UniversalRootModel):
    factory: typing.ClassVar[_Factory] = _Factory()
    
    if IS_PYDANTIC_V2:
        root: typing_extensions.Annotated[typing.Union[_DiscriminatedLiteral.CustomName, _DiscriminatedLiteral.DefaultName, _DiscriminatedLiteral.George, _DiscriminatedLiteral.LiteralGeorge], pydantic.Field(discriminator="type")]
        def get_as_union(self) -> typing.Union[_DiscriminatedLiteral.CustomName, _DiscriminatedLiteral.DefaultName, _DiscriminatedLiteral.George, _DiscriminatedLiteral.LiteralGeorge]:
            return self.root
    else:
        __root__: typing_extensions.Annotated[typing.Union[_DiscriminatedLiteral.CustomName, _DiscriminatedLiteral.DefaultName, _DiscriminatedLiteral.George, _DiscriminatedLiteral.LiteralGeorge], pydantic.Field(discriminator="type")]
        def get_as_union(self) -> typing.Union[_DiscriminatedLiteral.CustomName, _DiscriminatedLiteral.DefaultName, _DiscriminatedLiteral.George, _DiscriminatedLiteral.LiteralGeorge]:
            return self.__root__
    
    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        if IS_PYDANTIC_V2:
            return self.root.dict(**kwargs)
        else:
            return self.__root__.dict(**kwargs)
    
    def visit(self, custom_name: typing.Callable[[str], T_Result], default_name: typing.Callable[[typing.Literal["Bob"]], T_Result], george: typing.Callable[[bool], T_Result], literal_george: typing.Callable[[typing.Literal[True]], T_Result]) -> T_Result:
        unioned_value = self.get_as_union()
        if unioned_value.type == "customName":
            return custom_name(
            unioned_value.value)
        if unioned_value.type == "defaultName":
            return default_name(
            unioned_value.value)
        if unioned_value.type == "george":
            return george(
            unioned_value.value)
        if unioned_value.type == "literalGeorge":
            return literal_george(
            unioned_value.value)
class _DiscriminatedLiteral:
    
    class CustomName(UniversalBaseModel):
        type: typing.Literal["customName"] = "customName"
        value: str
    
    class DefaultName(UniversalBaseModel):
        type: typing.Literal["defaultName"] = "defaultName"
        value: typing.Literal["Bob"]
    
    class George(UniversalBaseModel):
        type: typing.Literal["george"] = "george"
        value: bool
    
    class LiteralGeorge(UniversalBaseModel):
        type: typing.Literal["literalGeorge"] = "literalGeorge"
        value: typing.Literal[True]
update_forward_refs(DiscriminatedLiteral)
