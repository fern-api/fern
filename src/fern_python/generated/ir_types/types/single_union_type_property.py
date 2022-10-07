import typing

import pydantic
import typing_extensions

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from .type_reference import TypeReference


class SingleUnionTypeProperty(pydantic.BaseModel):
    name: WireStringWithAllCasings
    type: TypeReference

    @pydantic.validator("name")
    def _validate_name(cls, name: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in SingleUnionTypeProperty.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("type")
    def _validate_type(cls, type: TypeReference) -> TypeReference:
        for validator in SingleUnionTypeProperty.Validators._type:
            type = validator(type)
        return type

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]] = []
        _type: typing.ClassVar[typing.List[typing.Callable[[TypeReference], TypeReference]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[
            [typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]],
            typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["type"]
        ) -> typing.Callable[
            [typing.Callable[[TypeReference], TypeReference]], typing.Callable[[TypeReference], TypeReference]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "type":
                    cls._type.append(validator)
                else:
                    raise RuntimeError("Field does not exist on SingleUnionTypeProperty: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
