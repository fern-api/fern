import typing

import pydantic
import typing_extensions

from ..commons.language import Language
from ..commons.problem_id import ProblemId
from .submission_file_info import SubmissionFileInfo
from .submission_id import SubmissionId


class SubmitRequestV2(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    language: Language
    submission_files: typing.List[SubmissionFileInfo] = pydantic.Field(alias="submissionFiles")
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_version: typing.Optional[int] = pydantic.Field(alias="problemVersion")
    user_id: typing.Optional[str] = pydantic.Field(alias="userId")

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in SubmitRequestV2.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("language")
    def _validate_language(cls, language: Language) -> Language:
        for validator in SubmitRequestV2.Validators._language:
            language = validator(language)
        return language

    @pydantic.validator("submission_files")
    def _validate_submission_files(
        cls, submission_files: typing.List[SubmissionFileInfo]
    ) -> typing.List[SubmissionFileInfo]:
        for validator in SubmitRequestV2.Validators._submission_files:
            submission_files = validator(submission_files)
        return submission_files

    @pydantic.validator("problem_id")
    def _validate_problem_id(cls, problem_id: ProblemId) -> ProblemId:
        for validator in SubmitRequestV2.Validators._problem_id:
            problem_id = validator(problem_id)
        return problem_id

    @pydantic.validator("problem_version")
    def _validate_problem_version(cls, problem_version: typing.Optional[int]) -> typing.Optional[int]:
        for validator in SubmitRequestV2.Validators._problem_version:
            problem_version = validator(problem_version)
        return problem_version

    @pydantic.validator("user_id")
    def _validate_user_id(cls, user_id: typing.Optional[str]) -> typing.Optional[str]:
        for validator in SubmitRequestV2.Validators._user_id:
            user_id = validator(user_id)
        return user_id

    class Validators:
        _submission_id: typing.ClassVar[typing.List[typing.Callable[[SubmissionId], SubmissionId]]] = []
        _language: typing.ClassVar[typing.List[typing.Callable[[Language], Language]]] = []
        _submission_files: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[SubmissionFileInfo]], typing.List[SubmissionFileInfo]]]
        ] = []
        _problem_id: typing.ClassVar[typing.List[typing.Callable[[ProblemId], ProblemId]]] = []
        _problem_version: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[int]], typing.Optional[int]]]
        ] = []
        _user_id: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[str]], typing.Optional[str]]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["submission_id"]
        ) -> typing.Callable[
            [typing.Callable[[SubmissionId], SubmissionId]], typing.Callable[[SubmissionId], SubmissionId]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["language"]
        ) -> typing.Callable[[typing.Callable[[Language], Language]], typing.Callable[[Language], Language]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["submission_files"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[SubmissionFileInfo]], typing.List[SubmissionFileInfo]]],
            typing.Callable[[typing.List[SubmissionFileInfo]], typing.List[SubmissionFileInfo]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_id"]
        ) -> typing.Callable[[typing.Callable[[ProblemId], ProblemId]], typing.Callable[[ProblemId], ProblemId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_version"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[int]], typing.Optional[int]]],
            typing.Callable[[typing.Optional[int]], typing.Optional[int]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["user_id"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[str]], typing.Optional[str]]],
            typing.Callable[[typing.Optional[str]], typing.Optional[str]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)
                elif field_name == "language":
                    cls._language.append(validator)
                elif field_name == "submission_files":
                    cls._submission_files.append(validator)
                elif field_name == "problem_id":
                    cls._problem_id.append(validator)
                elif field_name == "problem_version":
                    cls._problem_version.append(validator)
                elif field_name == "user_id":
                    cls._user_id.append(validator)
                else:
                    raise RuntimeError("Field does not exist on SubmitRequestV2: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
