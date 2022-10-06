import typing

import pydantic
import typing_extensions

from ...commons.language import Language
from ...problem.problem_description import ProblemDescription
from .custom_files import CustomFiles
from .test_case_template import TestCaseTemplate
from .test_case_v2 import TestCaseV2


class CreateProblemRequestV2(pydantic.BaseModel):
    problem_name: str = pydantic.Field(alias="problemName")
    problem_description: ProblemDescription = pydantic.Field(alias="problemDescription")
    custom_files: CustomFiles = pydantic.Field(alias="customFiles")
    custom_test_case_templates: typing.List[TestCaseTemplate] = pydantic.Field(alias="customTestCaseTemplates")
    testcases: typing.List[TestCaseV2]
    supported_languages: typing.List[Language] = pydantic.Field(alias="supportedLanguages")
    is_public: bool = pydantic.Field(alias="isPublic")

    @pydantic.validator("problem_name")
    def _validate_problem_name(cls, problem_name: str) -> str:
        for validator in CreateProblemRequestV2.Validators._problem_name:
            problem_name = validator(problem_name)
        return problem_name

    @pydantic.validator("problem_description")
    def _validate_problem_description(cls, problem_description: ProblemDescription) -> ProblemDescription:
        for validator in CreateProblemRequestV2.Validators._problem_description:
            problem_description = validator(problem_description)
        return problem_description

    @pydantic.validator("custom_files")
    def _validate_custom_files(cls, custom_files: CustomFiles) -> CustomFiles:
        for validator in CreateProblemRequestV2.Validators._custom_files:
            custom_files = validator(custom_files)
        return custom_files

    @pydantic.validator("custom_test_case_templates")
    def _validate_custom_test_case_templates(
        cls, custom_test_case_templates: typing.List[TestCaseTemplate]
    ) -> typing.List[TestCaseTemplate]:
        for validator in CreateProblemRequestV2.Validators._custom_test_case_templates:
            custom_test_case_templates = validator(custom_test_case_templates)
        return custom_test_case_templates

    @pydantic.validator("testcases")
    def _validate_testcases(cls, testcases: typing.List[TestCaseV2]) -> typing.List[TestCaseV2]:
        for validator in CreateProblemRequestV2.Validators._testcases:
            testcases = validator(testcases)
        return testcases

    @pydantic.validator("supported_languages")
    def _validate_supported_languages(cls, supported_languages: typing.List[Language]) -> typing.List[Language]:
        for validator in CreateProblemRequestV2.Validators._supported_languages:
            supported_languages = validator(supported_languages)
        return supported_languages

    @pydantic.validator("is_public")
    def _validate_is_public(cls, is_public: bool) -> bool:
        for validator in CreateProblemRequestV2.Validators._is_public:
            is_public = validator(is_public)
        return is_public

    class Validators:
        _problem_name: typing.ClassVar[str] = []
        _problem_description: typing.ClassVar[ProblemDescription] = []
        _custom_files: typing.ClassVar[CustomFiles] = []
        _custom_test_case_templates: typing.ClassVar[typing.List[TestCaseTemplate]] = []
        _testcases: typing.ClassVar[typing.List[TestCaseV2]] = []
        _supported_languages: typing.ClassVar[typing.List[Language]] = []
        _is_public: typing.ClassVar[bool] = []

        @typing.overload
        @classmethod
        def field(problem_name: typing_extensions.Literal["problem_name"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(problem_description: typing_extensions.Literal["problem_description"]) -> ProblemDescription:
            ...

        @typing.overload
        @classmethod
        def field(custom_files: typing_extensions.Literal["custom_files"]) -> CustomFiles:
            ...

        @typing.overload
        @classmethod
        def field(
            custom_test_case_templates: typing_extensions.Literal["custom_test_case_templates"],
        ) -> typing.List[TestCaseTemplate]:
            ...

        @typing.overload
        @classmethod
        def field(testcases: typing_extensions.Literal["testcases"]) -> typing.List[TestCaseV2]:
            ...

        @typing.overload
        @classmethod
        def field(supported_languages: typing_extensions.Literal["supported_languages"]) -> typing.List[Language]:
            ...

        @typing.overload
        @classmethod
        def field(is_public: typing_extensions.Literal["is_public"]) -> bool:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "problem_name":
                    cls._problem_name.append(validator)  # type: ignore
                elif field_name == "problem_description":
                    cls._problem_description.append(validator)  # type: ignore
                elif field_name == "custom_files":
                    cls._custom_files.append(validator)  # type: ignore
                elif field_name == "custom_test_case_templates":
                    cls._custom_test_case_templates.append(validator)  # type: ignore
                elif field_name == "testcases":
                    cls._testcases.append(validator)  # type: ignore
                elif field_name == "supported_languages":
                    cls._supported_languages.append(validator)  # type: ignore
                elif field_name == "is_public":
                    cls._is_public.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on CreateProblemRequestV2: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
