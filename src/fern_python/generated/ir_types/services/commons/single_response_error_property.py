import typing

import pydantic
import typing_extensions

from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
from ...errors.declared_error_name import DeclaredErrorName


class SingleResponseErrorProperty(pydantic.BaseModel):
    name: WireStringWithAllCasings
    error: DeclaredErrorName

    @pydantic.validator("name")
    def _validate_name(cls, name: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in SingleResponseErrorProperty.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("error")
    def _validate_error(cls, error: DeclaredErrorName) -> DeclaredErrorName:
        for validator in SingleResponseErrorProperty.Validators._error:
            error = validator(error)
        return error

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]] = []
        _error: typing.ClassVar[typing.List[typing.Callable[[DeclaredErrorName], DeclaredErrorName]]] = []

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
            cls, field_name: typing_extensions.Literal["error"]
        ) -> typing.Callable[
            [typing.Callable[[DeclaredErrorName], DeclaredErrorName]],
            typing.Callable[[DeclaredErrorName], DeclaredErrorName],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "error":
                    cls._error.append(validator)
                else:
                    raise RuntimeError("Field does not exist on SingleResponseErrorProperty: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
