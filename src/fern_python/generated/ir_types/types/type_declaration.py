import typing

import pydantic
import typing_extensions

from ..commons.with_docs import WithDocs
from .declared_type_name import DeclaredTypeName
from .type import Type


class TypeDeclaration(WithDocs):
    name: DeclaredTypeName
    shape: Type
    referenced_types: typing.List[DeclaredTypeName] = pydantic.Field(alias="referencedTypes")

    @pydantic.validator("name")
    def _validate_name(cls, name: DeclaredTypeName) -> DeclaredTypeName:
        for validator in TypeDeclaration.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("shape")
    def _validate_shape(cls, shape: Type) -> Type:
        for validator in TypeDeclaration.Validators._shape:
            shape = validator(shape)
        return shape

    @pydantic.validator("referenced_types")
    def _validate_referenced_types(
        cls, referenced_types: typing.List[DeclaredTypeName]
    ) -> typing.List[DeclaredTypeName]:
        for validator in TypeDeclaration.Validators._referenced_types:
            referenced_types = validator(referenced_types)
        return referenced_types

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[DeclaredTypeName], DeclaredTypeName]]] = []
        _shape: typing.ClassVar[typing.List[typing.Callable[[Type], Type]]] = []
        _referenced_types: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[DeclaredTypeName]], typing.List[DeclaredTypeName]]]
        ] = []

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
        ) -> typing.Callable[[typing.Callable[[Type], Type]], typing.Callable[[Type], Type]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["referenced_types"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[DeclaredTypeName]], typing.List[DeclaredTypeName]]],
            typing.Callable[[typing.List[DeclaredTypeName]], typing.List[DeclaredTypeName]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "shape":
                    cls._shape.append(validator)
                elif field_name == "referenced_types":
                    cls._referenced_types.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TypeDeclaration: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
