import typing

import pydantic
import typing_extensions

from ..commons.debug_variable_value import DebugVariableValue
from .expression_location import ExpressionLocation
from .stack_information import StackInformation
from .submission_id import SubmissionId


class TraceResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    line_number: int = pydantic.Field(alias="lineNumber")
    return_value: typing.Optional[DebugVariableValue] = pydantic.Field(alias="returnValue")
    expression_location: typing.Optional[ExpressionLocation] = pydantic.Field(alias="expressionLocation")
    stack: StackInformation
    stdout: typing.Optional[str]

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in TraceResponse.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("line_number")
    def _validate_line_number(cls, line_number: int) -> int:
        for validator in TraceResponse.Validators._line_number:
            line_number = validator(line_number)
        return line_number

    @pydantic.validator("return_value")
    def _validate_return_value(
        cls, return_value: typing.Optional[DebugVariableValue]
    ) -> typing.Optional[DebugVariableValue]:
        for validator in TraceResponse.Validators._return_value:
            return_value = validator(return_value)
        return return_value

    @pydantic.validator("expression_location")
    def _validate_expression_location(
        cls, expression_location: typing.Optional[ExpressionLocation]
    ) -> typing.Optional[ExpressionLocation]:
        for validator in TraceResponse.Validators._expression_location:
            expression_location = validator(expression_location)
        return expression_location

    @pydantic.validator("stack")
    def _validate_stack(cls, stack: StackInformation) -> StackInformation:
        for validator in TraceResponse.Validators._stack:
            stack = validator(stack)
        return stack

    @pydantic.validator("stdout")
    def _validate_stdout(cls, stdout: typing.Optional[str]) -> typing.Optional[str]:
        for validator in TraceResponse.Validators._stdout:
            stdout = validator(stdout)
        return stdout

    class Validators:
        _submission_id: typing.ClassVar[SubmissionId] = []
        _line_number: typing.ClassVar[int] = []
        _return_value: typing.ClassVar[typing.Optional[DebugVariableValue]] = []
        _expression_location: typing.ClassVar[typing.Optional[ExpressionLocation]] = []
        _stack: typing.ClassVar[StackInformation] = []
        _stdout: typing.ClassVar[typing.Optional[str]] = []

        @typing.overload
        @classmethod
        def field(submission_id: typing_extensions.Literal["submission_id"]) -> SubmissionId:
            ...

        @typing.overload
        @classmethod
        def field(line_number: typing_extensions.Literal["line_number"]) -> int:
            ...

        @typing.overload
        @classmethod
        def field(return_value: typing_extensions.Literal["return_value"]) -> typing.Optional[DebugVariableValue]:
            ...

        @typing.overload
        @classmethod
        def field(
            expression_location: typing_extensions.Literal["expression_location"],
        ) -> typing.Optional[ExpressionLocation]:
            ...

        @typing.overload
        @classmethod
        def field(stack: typing_extensions.Literal["stack"]) -> StackInformation:
            ...

        @typing.overload
        @classmethod
        def field(stdout: typing_extensions.Literal["stdout"]) -> typing.Optional[str]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)  # type: ignore
                elif field_name == "line_number":
                    cls._line_number.append(validator)  # type: ignore
                elif field_name == "return_value":
                    cls._return_value.append(validator)  # type: ignore
                elif field_name == "expression_location":
                    cls._expression_location.append(validator)  # type: ignore
                elif field_name == "stack":
                    cls._stack.append(validator)  # type: ignore
                elif field_name == "stdout":
                    cls._stdout.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on TraceResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
