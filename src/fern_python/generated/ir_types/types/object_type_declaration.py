import typing

import pydantic
import typing_extensions

from .declared_type_name import DeclaredTypeName
from .object_property import ObjectProperty


class ObjectTypeDeclaration(pydantic.BaseModel):
    extends: typing.List[DeclaredTypeName]
    properties: typing.List[ObjectProperty]

    @pydantic.validator("extends")
    def _validate_extends(cls, extends: typing.List[DeclaredTypeName]) -> typing.List[DeclaredTypeName]:
        for validator in ObjectTypeDeclaration.Validators._extends:
            extends = validator(extends)
        return extends

    @pydantic.validator("properties")
    def _validate_properties(cls, properties: typing.List[ObjectProperty]) -> typing.List[ObjectProperty]:
        for validator in ObjectTypeDeclaration.Validators._properties:
            properties = validator(properties)
        return properties

    class Validators:
        _extends: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[DeclaredTypeName]], typing.List[DeclaredTypeName]]]
        ] = []
        _properties: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[ObjectProperty]], typing.List[ObjectProperty]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["extends"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[DeclaredTypeName]], typing.List[DeclaredTypeName]]],
            typing.Callable[[typing.List[DeclaredTypeName]], typing.List[DeclaredTypeName]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["properties"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[ObjectProperty]], typing.List[ObjectProperty]]],
            typing.Callable[[typing.List[ObjectProperty]], typing.List[ObjectProperty]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "extends":
                    cls._extends.append(validator)
                elif field_name == "properties":
                    cls._properties.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ObjectTypeDeclaration: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
