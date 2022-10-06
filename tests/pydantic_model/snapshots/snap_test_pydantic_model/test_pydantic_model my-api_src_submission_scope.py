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
        _variables: typing.ClassVar[typing.Dict[str, DebugVariableValue]] = []

        @typing.overload
        @classmethod
        def field(variables: typing_extensions.Literal["variables"]) -> typing.Dict[str, DebugVariableValue]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "variables":
                    cls._variables.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on Scope: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
