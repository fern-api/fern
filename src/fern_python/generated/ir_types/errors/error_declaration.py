import typing

import pydantic
import typing_extensions

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs
from ..types.type import Type
from .declared_error_name import DeclaredErrorName
from .http_error_configuration import HttpErrorConfiguration


class ErrorDeclaration(WithDocs):
    name: DeclaredErrorName
    discriminant_value: WireStringWithAllCasings = pydantic.Field(alias="discriminantValue")
    type: Type
    type_v_2: typing.Optional[Type] = pydantic.Field(alias="typeV2")
    http: typing.Optional[HttpErrorConfiguration]

    @pydantic.validator("name")
    def _validate_name(cls, name: DeclaredErrorName) -> DeclaredErrorName:
        for validator in ErrorDeclaration.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("discriminant_value")
    def _validate_discriminant_value(cls, discriminant_value: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in ErrorDeclaration.Validators._discriminant_value:
            discriminant_value = validator(discriminant_value)
        return discriminant_value

    @pydantic.validator("type")
    def _validate_type(cls, type: Type) -> Type:
        for validator in ErrorDeclaration.Validators._type:
            type = validator(type)
        return type

    @pydantic.validator("type_v_2")
    def _validate_type_v_2(cls, type_v_2: typing.Optional[Type]) -> typing.Optional[Type]:
        for validator in ErrorDeclaration.Validators._type_v_2:
            type_v_2 = validator(type_v_2)
        return type_v_2

    @pydantic.validator("http")
    def _validate_http(cls, http: typing.Optional[HttpErrorConfiguration]) -> typing.Optional[HttpErrorConfiguration]:
        for validator in ErrorDeclaration.Validators._http:
            http = validator(http)
        return http

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[DeclaredErrorName], DeclaredErrorName]]] = []
        _discriminant_value: typing.ClassVar[
            typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]
        ] = []
        _type: typing.ClassVar[typing.List[typing.Callable[[Type], Type]]] = []
        _type_v_2: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[Type]], typing.Optional[Type]]]] = []
        _http: typing.ClassVar[
            typing.List[
                typing.Callable[[typing.Optional[HttpErrorConfiguration]], typing.Optional[HttpErrorConfiguration]]
            ]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[
            [typing.Callable[[DeclaredErrorName], DeclaredErrorName]],
            typing.Callable[[DeclaredErrorName], DeclaredErrorName],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["discriminant_value"]
        ) -> typing.Callable[
            [typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]],
            typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["type"]
        ) -> typing.Callable[[typing.Callable[[Type], Type]], typing.Callable[[Type], Type]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["type_v_2"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[Type]], typing.Optional[Type]]],
            typing.Callable[[typing.Optional[Type]], typing.Optional[Type]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["http"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[HttpErrorConfiguration]], typing.Optional[HttpErrorConfiguration]]],
            typing.Callable[[typing.Optional[HttpErrorConfiguration]], typing.Optional[HttpErrorConfiguration]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "discriminant_value":
                    cls._discriminant_value.append(validator)
                elif field_name == "type":
                    cls._type.append(validator)
                elif field_name == "type_v_2":
                    cls._type_v_2.append(validator)
                elif field_name == "http":
                    cls._http.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ErrorDeclaration: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
