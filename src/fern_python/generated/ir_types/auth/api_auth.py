import typing

import pydantic
import typing_extensions

from ..commons.with_docs import WithDocs
from .auth_scheme import AuthScheme
from .auth_schemes_requirement import AuthSchemesRequirement


class ApiAuth(WithDocs):
    requirement: AuthSchemesRequirement
    schemes: typing.List[AuthScheme]

    @pydantic.validator("requirement")
    def _validate_requirement(cls, requirement: AuthSchemesRequirement) -> AuthSchemesRequirement:
        for validator in ApiAuth.Validators._requirement:
            requirement = validator(requirement)
        return requirement

    @pydantic.validator("schemes")
    def _validate_schemes(cls, schemes: typing.List[AuthScheme]) -> typing.List[AuthScheme]:
        for validator in ApiAuth.Validators._schemes:
            schemes = validator(schemes)
        return schemes

    class Validators:
        _requirement: typing.ClassVar[
            typing.List[typing.Callable[[AuthSchemesRequirement], AuthSchemesRequirement]]
        ] = []
        _schemes: typing.ClassVar[typing.List[typing.Callable[[typing.List[AuthScheme]], typing.List[AuthScheme]]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["requirement"]
        ) -> typing.Callable[
            [typing.Callable[[AuthSchemesRequirement], AuthSchemesRequirement]],
            typing.Callable[[AuthSchemesRequirement], AuthSchemesRequirement],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["schemes"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[AuthScheme]], typing.List[AuthScheme]]],
            typing.Callable[[typing.List[AuthScheme]], typing.List[AuthScheme]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "requirement":
                    cls._requirement.append(validator)
                elif field_name == "schemes":
                    cls._schemes.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ApiAuth: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
