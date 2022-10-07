import typing

import pydantic
import typing_extensions

from .declared_type_name import DeclaredTypeName
from .shape_type import ShapeType


class ResolvedNamedType(pydantic.BaseModel):
    name: DeclaredTypeName
    shape: ShapeType

    @pydantic.validator("name")
    def _validate_name(cls, name: DeclaredTypeName) -> DeclaredTypeName:
        for validator in ResolvedNamedType.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("shape")
    def _validate_shape(cls, shape: ShapeType) -> ShapeType:
        for validator in ResolvedNamedType.Validators._shape:
            shape = validator(shape)
        return shape

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[DeclaredTypeName], DeclaredTypeName]]] = []
        _shape: typing.ClassVar[typing.List[typing.Callable[[ShapeType], ShapeType]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[
            [typing.Callable[[DeclaredTypeName], DeclaredTypeName]],
            typing.Callable[[DeclaredTypeName], DeclaredTypeName],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["shape"]
        ) -> typing.Callable[[typing.Callable[[ShapeType], ShapeType]], typing.Callable[[ShapeType], ShapeType]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "shape":
                    cls._shape.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ResolvedNamedType: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
