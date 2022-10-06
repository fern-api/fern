import typing

import pydantic
import typing_extensions

from ..commons.problem_id import ProblemId


class InitializeProblemRequest(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_version: typing.Optional[int] = pydantic.Field(alias="problemVersion")

    @pydantic.validator("problem_id")
    def _validate_problem_id(cls, problem_id: ProblemId) -> ProblemId:
        for validator in InitializeProblemRequest.Validators._problem_id:
            problem_id = validator(problem_id)
        return problem_id

    @pydantic.validator("problem_version")
    def _validate_problem_version(cls, problem_version: typing.Optional[int]) -> typing.Optional[int]:
        for validator in InitializeProblemRequest.Validators._problem_version:
            problem_version = validator(problem_version)
        return problem_version

    class Validators:
        _problem_id: typing.ClassVar[ProblemId] = []
        _problem_version: typing.ClassVar[typing.Optional[int]] = []

        @typing.overload
        @classmethod
        def field(problem_id: typing_extensions.Literal["problem_id"]) -> ProblemId:
            ...

        @typing.overload
        @classmethod
        def field(problem_version: typing_extensions.Literal["problem_version"]) -> typing.Optional[int]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "problem_id":
                    cls._problem_id.append(validator)  # type: ignore
                elif field_name == "problem_version":
                    cls._problem_version.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on InitializeProblemRequest: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
