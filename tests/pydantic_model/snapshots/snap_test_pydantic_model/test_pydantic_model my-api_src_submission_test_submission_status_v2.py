import typing

import pydantic
import typing_extensions

from ..commons.problem_id import ProblemId
from ..v_2.problem.problem_info_v2 import ProblemInfoV2
from .test_submission_update import TestSubmissionUpdate


class TestSubmissionStatusV2(pydantic.BaseModel):
    updates: typing.List[TestSubmissionUpdate]
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_version: int = pydantic.Field(alias="problemVersion")
    problem_info: ProblemInfoV2 = pydantic.Field(alias="problemInfo")

    @pydantic.validator("updates")
    def _validate_updates(cls, updates: typing.List[TestSubmissionUpdate]) -> typing.List[TestSubmissionUpdate]:
        for validator in TestSubmissionStatusV2.Validators._updates:
            updates = validator(updates)
        return updates

    @pydantic.validator("problem_id")
    def _validate_problem_id(cls, problem_id: ProblemId) -> ProblemId:
        for validator in TestSubmissionStatusV2.Validators._problem_id:
            problem_id = validator(problem_id)
        return problem_id

    @pydantic.validator("problem_version")
    def _validate_problem_version(cls, problem_version: int) -> int:
        for validator in TestSubmissionStatusV2.Validators._problem_version:
            problem_version = validator(problem_version)
        return problem_version

    @pydantic.validator("problem_info")
    def _validate_problem_info(cls, problem_info: ProblemInfoV2) -> ProblemInfoV2:
        for validator in TestSubmissionStatusV2.Validators._problem_info:
            problem_info = validator(problem_info)
        return problem_info

    class Validators:
        _updates: typing.ClassVar[typing.List[TestSubmissionUpdate]] = []
        _problem_id: typing.ClassVar[ProblemId] = []
        _problem_version: typing.ClassVar[int] = []
        _problem_info: typing.ClassVar[ProblemInfoV2] = []

        @typing.overload
        @classmethod
        def field(updates: typing_extensions.Literal["updates"]) -> typing.List[TestSubmissionUpdate]:
            ...

        @typing.overload
        @classmethod
        def field(problem_id: typing_extensions.Literal["problem_id"]) -> ProblemId:
            ...

        @typing.overload
        @classmethod
        def field(problem_version: typing_extensions.Literal["problem_version"]) -> int:
            ...

        @typing.overload
        @classmethod
        def field(problem_info: typing_extensions.Literal["problem_info"]) -> ProblemInfoV2:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "updates":
                    cls._updates.append(validator)  # type: ignore
                elif field_name == "problem_id":
                    cls._problem_id.append(validator)  # type: ignore
                elif field_name == "problem_version":
                    cls._problem_version.append(validator)  # type: ignore
                elif field_name == "problem_info":
                    cls._problem_info.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on TestSubmissionStatusV2: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
