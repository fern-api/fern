import typing

import pydantic
import typing_extensions

from ..commons.debug_variable_value import DebugVariableValue


class Scope(pydantic.BaseModel):
    variables: typing.Dict[str, DebugVariableValue]

    @pydantic.validator("variables")
    def _validate_variables(
        cls, variables: typing.Dict[str, DebugVariableValue]
    ) -> typing.Dict[str, DebugVariableValue]:
        for validator in Scope.Validators._variables:
            variables = validator(variables)
        return variables

    class Validators:
        _variables: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[str, DebugVariableValue]], typing.Dict[str, DebugVariableValue]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["variables"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[str, DebugVariableValue]], typing.Dict[str, DebugVariableValue]]],
            typing.Callable[[typing.Dict[str, DebugVariableValue]], typing.Dict[str, DebugVariableValue]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "variables":
                    cls._variables.append(validator)
                else:
                    raise RuntimeError("Field does not exist on Scope: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
