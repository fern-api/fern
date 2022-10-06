import typing

import pydantic
import typing_extensions

from .execution_session_state import ExecutionSessionState


class GetExecutionSessionStateResponse(pydantic.BaseModel):
    states: typing.Dict[str, ExecutionSessionState]
    num_warming_instances: typing.Optional[int] = pydantic.Field(alias="numWarmingInstances")
    warming_session_ids: typing.List[str] = pydantic.Field(alias="warmingSessionIds")

    @pydantic.validator("states")
    def _validate_states(
        cls, states: typing.Dict[str, ExecutionSessionState]
    ) -> typing.Dict[str, ExecutionSessionState]:
        for validator in GetExecutionSessionStateResponse.Validators._states:
            states = validator(states)
        return states

    @pydantic.validator("num_warming_instances")
    def _validate_num_warming_instances(cls, num_warming_instances: typing.Optional[int]) -> typing.Optional[int]:
        for validator in GetExecutionSessionStateResponse.Validators._num_warming_instances:
            num_warming_instances = validator(num_warming_instances)
        return num_warming_instances

    @pydantic.validator("warming_session_ids")
    def _validate_warming_session_ids(cls, warming_session_ids: typing.List[str]) -> typing.List[str]:
        for validator in GetExecutionSessionStateResponse.Validators._warming_session_ids:
            warming_session_ids = validator(warming_session_ids)
        return warming_session_ids

    class Validators:
        _states: typing.ClassVar[typing.Dict[str, ExecutionSessionState]] = []
        _num_warming_instances: typing.ClassVar[typing.Optional[int]] = []
        _warming_session_ids: typing.ClassVar[typing.List[str]] = []

        @typing.overload
        @classmethod
        def field(states: typing_extensions.Literal["states"]) -> typing.Dict[str, ExecutionSessionState]:
            ...

        @typing.overload
        @classmethod
        def field(num_warming_instances: typing_extensions.Literal["num_warming_instances"]) -> typing.Optional[int]:
            ...

        @typing.overload
        @classmethod
        def field(warming_session_ids: typing_extensions.Literal["warming_session_ids"]) -> typing.List[str]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "states":
                    cls._states.append(validator)  # type: ignore
                elif field_name == "num_warming_instances":
                    cls._num_warming_instances.append(validator)  # type: ignore
                elif field_name == "warming_session_ids":
                    cls._warming_session_ids.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on GetExecutionSessionStateResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
