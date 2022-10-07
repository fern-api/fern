import typing

import pydantic
import typing_extensions

from ..auth.api_auth import ApiAuth
from ..errors.error_declaration import ErrorDeclaration
from ..types.type_declaration import TypeDeclaration
from .fern_constants import FernConstants
from .services import Services


class IntermediateRepresentation(pydantic.BaseModel):
    api_name: str = pydantic.Field(alias="apiName")
    auth: ApiAuth
    types: typing.List[TypeDeclaration]
    services: Services
    errors: typing.List[ErrorDeclaration]
    constants: FernConstants

    @pydantic.validator("api_name")
    def _validate_api_name(cls, api_name: str) -> str:
        for validator in IntermediateRepresentation.Validators._api_name:
            api_name = validator(api_name)
        return api_name

    @pydantic.validator("auth")
    def _validate_auth(cls, auth: ApiAuth) -> ApiAuth:
        for validator in IntermediateRepresentation.Validators._auth:
            auth = validator(auth)
        return auth

    @pydantic.validator("types")
    def _validate_types(cls, types: typing.List[TypeDeclaration]) -> typing.List[TypeDeclaration]:
        for validator in IntermediateRepresentation.Validators._types:
            types = validator(types)
        return types

    @pydantic.validator("services")
    def _validate_services(cls, services: Services) -> Services:
        for validator in IntermediateRepresentation.Validators._services:
            services = validator(services)
        return services

    @pydantic.validator("errors")
    def _validate_errors(cls, errors: typing.List[ErrorDeclaration]) -> typing.List[ErrorDeclaration]:
        for validator in IntermediateRepresentation.Validators._errors:
            errors = validator(errors)
        return errors

    @pydantic.validator("constants")
    def _validate_constants(cls, constants: FernConstants) -> FernConstants:
        for validator in IntermediateRepresentation.Validators._constants:
            constants = validator(constants)
        return constants

    class Validators:
        _api_name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _auth: typing.ClassVar[typing.List[typing.Callable[[ApiAuth], ApiAuth]]] = []
        _types: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[TypeDeclaration]], typing.List[TypeDeclaration]]]
        ] = []
        _services: typing.ClassVar[typing.List[typing.Callable[[Services], Services]]] = []
        _errors: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[ErrorDeclaration]], typing.List[ErrorDeclaration]]]
        ] = []
        _constants: typing.ClassVar[typing.List[typing.Callable[[FernConstants], FernConstants]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["api_name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["auth"]
        ) -> typing.Callable[[typing.Callable[[ApiAuth], ApiAuth]], typing.Callable[[ApiAuth], ApiAuth]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["types"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[TypeDeclaration]], typing.List[TypeDeclaration]]],
            typing.Callable[[typing.List[TypeDeclaration]], typing.List[TypeDeclaration]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["services"]
        ) -> typing.Callable[[typing.Callable[[Services], Services]], typing.Callable[[Services], Services]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["errors"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[ErrorDeclaration]], typing.List[ErrorDeclaration]]],
            typing.Callable[[typing.List[ErrorDeclaration]], typing.List[ErrorDeclaration]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["constants"]
        ) -> typing.Callable[
            [typing.Callable[[FernConstants], FernConstants]], typing.Callable[[FernConstants], FernConstants]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "api_name":
                    cls._api_name.append(validator)
                elif field_name == "auth":
                    cls._auth.append(validator)
                elif field_name == "types":
                    cls._types.append(validator)
                elif field_name == "services":
                    cls._services.append(validator)
                elif field_name == "errors":
                    cls._errors.append(validator)
                elif field_name == "constants":
                    cls._constants.append(validator)
                else:
                    raise RuntimeError("Field does not exist on IntermediateRepresentation: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
