import typing

import pydantic
import typing_extensions

from .migration_status import MigrationStatus


class Migration(pydantic.BaseModel):
    name: str
    status: MigrationStatus

    @pydantic.validator("name")
    def _validate_name(cls, name: str) -> str:
        for validator in Migration.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("status")
    def _validate_status(cls, status: MigrationStatus) -> MigrationStatus:
        for validator in Migration.Validators._status:
            status = validator(status)
        return status

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _status: typing.ClassVar[typing.List[typing.Callable[[MigrationStatus], MigrationStatus]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["status"]
        ) -> typing.Callable[
            [typing.Callable[[MigrationStatus], MigrationStatus]], typing.Callable[[MigrationStatus], MigrationStatus]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "status":
                    cls._status.append(validator)
                else:
                    raise RuntimeError("Field does not exist on Migration: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
