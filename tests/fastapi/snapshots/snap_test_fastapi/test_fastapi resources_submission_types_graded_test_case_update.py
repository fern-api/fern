import typing

import pydantic
import typing_extensions

from ...v_2.problem.types.test_case_id import TestCaseId
from .test_case_grade import TestCaseGrade


class GradedTestCaseUpdate(pydantic.BaseModel):
    test_case_id: TestCaseId = pydantic.Field(alias="testCaseId")
    grade: TestCaseGrade

    @pydantic.validator("test_case_id")
    def _validate_test_case_id(cls, test_case_id: TestCaseId) -> TestCaseId:
        for validator in GradedTestCaseUpdate.Validators._test_case_id:
            test_case_id = validator(test_case_id)
        return test_case_id

    @pydantic.validator("grade")
    def _validate_grade(cls, grade: TestCaseGrade) -> TestCaseGrade:
        for validator in GradedTestCaseUpdate.Validators._grade:
            grade = validator(grade)
        return grade

    class Validators:
        _test_case_id: typing.ClassVar[typing.List[typing.Callable[[TestCaseId], TestCaseId]]] = []
        _grade: typing.ClassVar[typing.List[typing.Callable[[TestCaseGrade], TestCaseGrade]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["test_case_id"]
        ) -> typing.Callable[[typing.Callable[[TestCaseId], TestCaseId]], typing.Callable[[TestCaseId], TestCaseId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["grade"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseGrade], TestCaseGrade]], typing.Callable[[TestCaseGrade], TestCaseGrade]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "test_case_id":
                    cls._test_case_id.append(validator)
                elif field_name == "grade":
                    cls._grade.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GradedTestCaseUpdate: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
