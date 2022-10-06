import typing

import pydantic
import typing_extensions

from ....commons.language import Language
from ....commons.problem_id import ProblemId
from ....problem.problem_description import ProblemDescription
from .custom_files import CustomFiles
from .generated_files import GeneratedFiles
from .test_case_template import TestCaseTemplate
from .test_case_v2 import TestCaseV2


class ProblemInfoV2(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_description: ProblemDescription = pydantic.Field(alias="problemDescription")
    problem_name: str = pydantic.Field(alias="problemName")
    problem_version: int = pydantic.Field(alias="problemVersion")
    supported_languages: typing.List[Language] = pydantic.Field(alias="supportedLanguages")
    custom_files: CustomFiles = pydantic.Field(alias="customFiles")
    generated_files: GeneratedFiles = pydantic.Field(alias="generatedFiles")
    custom_test_case_templates: typing.List[TestCaseTemplate] = pydantic.Field(alias="customTestCaseTemplates")
    testcases: typing.List[TestCaseV2]
    is_public: bool = pydantic.Field(alias="isPublic")

    @pydantic.validator("problem_id")
    def _validate_problem_id(cls, problem_id: ProblemId) -> ProblemId:
        for validator in ProblemInfoV2.Validators._problem_id:
            problem_id = validator(problem_id)
        return problem_id

    @pydantic.validator("problem_description")
    def _validate_problem_description(cls, problem_description: ProblemDescription) -> ProblemDescription:
        for validator in ProblemInfoV2.Validators._problem_description:
            problem_description = validator(problem_description)
        return problem_description

    @pydantic.validator("problem_name")
    def _validate_problem_name(cls, problem_name: str) -> str:
        for validator in ProblemInfoV2.Validators._problem_name:
            problem_name = validator(problem_name)
        return problem_name

    @pydantic.validator("problem_version")
    def _validate_problem_version(cls, problem_version: int) -> int:
        for validator in ProblemInfoV2.Validators._problem_version:
            problem_version = validator(problem_version)
        return problem_version

    @pydantic.validator("supported_languages")
    def _validate_supported_languages(cls, supported_languages: typing.List[Language]) -> typing.List[Language]:
        for validator in ProblemInfoV2.Validators._supported_languages:
            supported_languages = validator(supported_languages)
        return supported_languages

    @pydantic.validator("custom_files")
    def _validate_custom_files(cls, custom_files: CustomFiles) -> CustomFiles:
        for validator in ProblemInfoV2.Validators._custom_files:
            custom_files = validator(custom_files)
        return custom_files

    @pydantic.validator("generated_files")
    def _validate_generated_files(cls, generated_files: GeneratedFiles) -> GeneratedFiles:
        for validator in ProblemInfoV2.Validators._generated_files:
            generated_files = validator(generated_files)
        return generated_files

    @pydantic.validator("custom_test_case_templates")
    def _validate_custom_test_case_templates(
        cls, custom_test_case_templates: typing.List[TestCaseTemplate]
    ) -> typing.List[TestCaseTemplate]:
        for validator in ProblemInfoV2.Validators._custom_test_case_templates:
            custom_test_case_templates = validator(custom_test_case_templates)
        return custom_test_case_templates

    @pydantic.validator("testcases")
    def _validate_testcases(cls, testcases: typing.List[TestCaseV2]) -> typing.List[TestCaseV2]:
        for validator in ProblemInfoV2.Validators._testcases:
            testcases = validator(testcases)
        return testcases

    @pydantic.validator("is_public")
    def _validate_is_public(cls, is_public: bool) -> bool:
        for validator in ProblemInfoV2.Validators._is_public:
            is_public = validator(is_public)
        return is_public

    class Validators:
        _problem_id: typing.ClassVar[ProblemId] = []
        _problem_description: typing.ClassVar[ProblemDescription] = []
        _problem_name: typing.ClassVar[str] = []
        _problem_version: typing.ClassVar[int] = []
        _supported_languages: typing.ClassVar[typing.List[Language]] = []
        _custom_files: typing.ClassVar[CustomFiles] = []
        _generated_files: typing.ClassVar[GeneratedFiles] = []
        _custom_test_case_templates: typing.ClassVar[typing.List[TestCaseTemplate]] = []
        _testcases: typing.ClassVar[typing.List[TestCaseV2]] = []
        _is_public: typing.ClassVar[bool] = []

        @typing.overload
        @classmethod
        def field(problem_id: typing_extensions.Literal["problem_id"]) -> ProblemId:
            ...

        @typing.overload
        @classmethod
        def field(problem_description: typing_extensions.Literal["problem_description"]) -> ProblemDescription:
            ...

        @typing.overload
        @classmethod
        def field(problem_name: typing_extensions.Literal["problem_name"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(problem_version: typing_extensions.Literal["problem_version"]) -> int:
            ...

        @typing.overload
        @classmethod
        def field(supported_languages: typing_extensions.Literal["supported_languages"]) -> typing.List[Language]:
            ...

        @typing.overload
        @classmethod
        def field(custom_files: typing_extensions.Literal["custom_files"]) -> CustomFiles:
            ...

        @typing.overload
        @classmethod
        def field(generated_files: typing_extensions.Literal["generated_files"]) -> GeneratedFiles:
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
        def field(is_public: typing_extensions.Literal["is_public"]) -> bool:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "problem_id":
                    cls._problem_id.append(validator)  # type: ignore
                elif field_name == "problem_description":
                    cls._problem_description.append(validator)  # type: ignore
                elif field_name == "problem_name":
                    cls._problem_name.append(validator)  # type: ignore
                elif field_name == "problem_version":
                    cls._problem_version.append(validator)  # type: ignore
                elif field_name == "supported_languages":
                    cls._supported_languages.append(validator)  # type: ignore
                elif field_name == "custom_files":
                    cls._custom_files.append(validator)  # type: ignore
                elif field_name == "generated_files":
                    cls._generated_files.append(validator)  # type: ignore
                elif field_name == "custom_test_case_templates":
                    cls._custom_test_case_templates.append(validator)  # type: ignore
                elif field_name == "testcases":
                    cls._testcases.append(validator)  # type: ignore
                elif field_name == "is_public":
                    cls._is_public.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on ProblemInfoV2: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
