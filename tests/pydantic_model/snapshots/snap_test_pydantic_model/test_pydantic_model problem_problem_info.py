import typing

import pydantic
import typing_extensions

from ..commons.language import Language
from ..commons.problem_id import ProblemId
from ..commons.test_case_with_expected_result import TestCaseWithExpectedResult
from ..commons.variable_type import VariableType
from .problem_description import ProblemDescription
from .problem_files import ProblemFiles
from .variable_type_and_name import VariableTypeAndName


class ProblemInfo(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_description: ProblemDescription = pydantic.Field(alias="problemDescription")
    problem_name: str = pydantic.Field(alias="problemName")
    problem_version: int = pydantic.Field(alias="problemVersion")
    files: typing.Dict[Language, ProblemFiles]
    input_params: typing.List[VariableTypeAndName] = pydantic.Field(alias="inputParams")
    output_type: VariableType = pydantic.Field(alias="outputType")
    testcases: typing.List[TestCaseWithExpectedResult]
    method_name: str = pydantic.Field(alias="methodName")
    supports_custom_test_cases: bool = pydantic.Field(alias="supportsCustomTestCases")

    @pydantic.validator("problem_id")
    def _validate_problem_id(cls, problem_id: ProblemId) -> ProblemId:
        for validator in ProblemInfo.Validators._problem_id:
            problem_id = validator(problem_id)
        return problem_id

    @pydantic.validator("problem_description")
    def _validate_problem_description(cls, problem_description: ProblemDescription) -> ProblemDescription:
        for validator in ProblemInfo.Validators._problem_description:
            problem_description = validator(problem_description)
        return problem_description

    @pydantic.validator("problem_name")
    def _validate_problem_name(cls, problem_name: str) -> str:
        for validator in ProblemInfo.Validators._problem_name:
            problem_name = validator(problem_name)
        return problem_name

    @pydantic.validator("problem_version")
    def _validate_problem_version(cls, problem_version: int) -> int:
        for validator in ProblemInfo.Validators._problem_version:
            problem_version = validator(problem_version)
        return problem_version

    @pydantic.validator("files")
    def _validate_files(cls, files: typing.Dict[Language, ProblemFiles]) -> typing.Dict[Language, ProblemFiles]:
        for validator in ProblemInfo.Validators._files:
            files = validator(files)
        return files

    @pydantic.validator("input_params")
    def _validate_input_params(cls, input_params: typing.List[VariableTypeAndName]) -> typing.List[VariableTypeAndName]:
        for validator in ProblemInfo.Validators._input_params:
            input_params = validator(input_params)
        return input_params

    @pydantic.validator("output_type")
    def _validate_output_type(cls, output_type: VariableType) -> VariableType:
        for validator in ProblemInfo.Validators._output_type:
            output_type = validator(output_type)
        return output_type

    @pydantic.validator("testcases")
    def _validate_testcases(
        cls, testcases: typing.List[TestCaseWithExpectedResult]
    ) -> typing.List[TestCaseWithExpectedResult]:
        for validator in ProblemInfo.Validators._testcases:
            testcases = validator(testcases)
        return testcases

    @pydantic.validator("method_name")
    def _validate_method_name(cls, method_name: str) -> str:
        for validator in ProblemInfo.Validators._method_name:
            method_name = validator(method_name)
        return method_name

    @pydantic.validator("supports_custom_test_cases")
    def _validate_supports_custom_test_cases(cls, supports_custom_test_cases: bool) -> bool:
        for validator in ProblemInfo.Validators._supports_custom_test_cases:
            supports_custom_test_cases = validator(supports_custom_test_cases)
        return supports_custom_test_cases

    class Validators:
        _problem_id: typing.ClassVar[typing.List[typing.Callable[[ProblemId], ProblemId]]] = []
        _problem_description: typing.ClassVar[
            typing.List[typing.Callable[[ProblemDescription], ProblemDescription]]
        ] = []
        _problem_name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _problem_version: typing.ClassVar[typing.List[typing.Callable[[int], int]]] = []
        _files: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, ProblemFiles]], typing.Dict[Language, ProblemFiles]]]
        ] = []
        _input_params: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[VariableTypeAndName]], typing.List[VariableTypeAndName]]]
        ] = []
        _output_type: typing.ClassVar[typing.List[typing.Callable[[VariableType], VariableType]]] = []
        _testcases: typing.ClassVar[
            typing.List[
                typing.Callable[[typing.List[TestCaseWithExpectedResult]], typing.List[TestCaseWithExpectedResult]]
            ]
        ] = []
        _method_name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _supports_custom_test_cases: typing.ClassVar[typing.List[typing.Callable[[bool], bool]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_id"]
        ) -> typing.Callable[[typing.Callable[[ProblemId], ProblemId]], typing.Callable[[ProblemId], ProblemId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_description"]
        ) -> typing.Callable[
            [typing.Callable[[ProblemDescription], ProblemDescription]],
            typing.Callable[[ProblemDescription], ProblemDescription],
        ]:
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
            cls, field_name: typing_extensions.Literal["files"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, ProblemFiles]], typing.Dict[Language, ProblemFiles]]],
            typing.Callable[[typing.Dict[Language, ProblemFiles]], typing.Dict[Language, ProblemFiles]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["input_params"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[VariableTypeAndName]], typing.List[VariableTypeAndName]]],
            typing.Callable[[typing.List[VariableTypeAndName]], typing.List[VariableTypeAndName]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["output_type"]
        ) -> typing.Callable[
            [typing.Callable[[VariableType], VariableType]], typing.Callable[[VariableType], VariableType]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["testcases"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[TestCaseWithExpectedResult]], typing.List[TestCaseWithExpectedResult]]],
            typing.Callable[[typing.List[TestCaseWithExpectedResult]], typing.List[TestCaseWithExpectedResult]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["method_name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["supports_custom_test_cases"]
        ) -> typing.Callable[[typing.Callable[[bool], bool]], typing.Callable[[bool], bool]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "problem_id":
                    cls._problem_id.append(validator)
                elif field_name == "problem_description":
                    cls._problem_description.append(validator)
                elif field_name == "problem_name":
                    cls._problem_name.append(validator)
                elif field_name == "problem_version":
                    cls._problem_version.append(validator)
                elif field_name == "files":
                    cls._files.append(validator)
                elif field_name == "input_params":
                    cls._input_params.append(validator)
                elif field_name == "output_type":
                    cls._output_type.append(validator)
                elif field_name == "testcases":
                    cls._testcases.append(validator)
                elif field_name == "method_name":
                    cls._method_name.append(validator)
                elif field_name == "supports_custom_test_cases":
                    cls._supports_custom_test_cases.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ProblemInfo: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
