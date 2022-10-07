import typing

import pydantic
import typing_extensions

from ....commons.problem_id import ProblemId
from ....commons.variable_type import VariableType


class LightweightProblemInfoV2(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_name: str = pydantic.Field(alias="problemName")
    problem_version: int = pydantic.Field(alias="problemVersion")
    variable_types: typing.List[VariableType] = pydantic.Field(alias="variableTypes")

    @pydantic.validator("problem_id")
    def _validate_problem_id(cls, problem_id: ProblemId) -> ProblemId:
        for validator in LightweightProblemInfoV2.Validators._problem_id:
            problem_id = validator(problem_id)
        return problem_id

    @pydantic.validator("problem_name")
    def _validate_problem_name(cls, problem_name: str) -> str:
        for validator in LightweightProblemInfoV2.Validators._problem_name:
            problem_name = validator(problem_name)
        return problem_name

    @pydantic.validator("problem_version")
    def _validate_problem_version(cls, problem_version: int) -> int:
        for validator in LightweightProblemInfoV2.Validators._problem_version:
            problem_version = validator(problem_version)
        return problem_version

    @pydantic.validator("variable_types")
    def _validate_variable_types(cls, variable_types: typing.List[VariableType]) -> typing.List[VariableType]:
        for validator in LightweightProblemInfoV2.Validators._variable_types:
            variable_types = validator(variable_types)
        return variable_types

    class Validators:
        _problem_id: typing.ClassVar[typing.List[typing.Callable[[ProblemId], ProblemId]]] = []
        _problem_name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _problem_version: typing.ClassVar[typing.List[typing.Callable[[int], int]]] = []
        _variable_types: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[VariableType]], typing.List[VariableType]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_id"]
        ) -> typing.Callable[[typing.Callable[[ProblemId], ProblemId]], typing.Callable[[ProblemId], ProblemId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_version"]
        ) -> typing.Callable[[typing.Callable[[int], int]], typing.Callable[[int], int]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["variable_types"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[VariableType]], typing.List[VariableType]]],
            typing.Callable[[typing.List[VariableType]], typing.List[VariableType]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "problem_id":
                    cls._problem_id.append(validator)
                elif field_name == "problem_name":
                    cls._problem_name.append(validator)
                elif field_name == "problem_version":
                    cls._problem_version.append(validator)
                elif field_name == "variable_types":
                    cls._variable_types.append(validator)
                else:
                    raise RuntimeError("Field does not exist on LightweightProblemInfoV2: " + field_name)

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
        allow_population_by_field_name = True
