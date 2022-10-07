import typing

import pydantic
import typing_extensions

from .test_case_result import TestCaseResult


class TestCaseResultWithStdout(pydantic.BaseModel):
    result: TestCaseResult
    stdout: str

    @pydantic.validator("result")
    def _validate_result(cls, result: TestCaseResult) -> TestCaseResult:
        for validator in TestCaseResultWithStdout.Validators._result:
            result = validator(result)
        return result

    @pydantic.validator("stdout")
    def _validate_stdout(cls, stdout: str) -> str:
        for validator in TestCaseResultWithStdout.Validators._stdout:
            stdout = validator(stdout)
        return stdout

    class Validators:
        _result: typing.ClassVar[typing.List[typing.Callable[[TestCaseResult], TestCaseResult]]] = []
        _stdout: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["result"]
        ) -> typing.Callable[
            [typing.Callable[[TestCaseResult], TestCaseResult]], typing.Callable[[TestCaseResult], TestCaseResult]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["stdout"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "result":
                    cls._result.append(validator)
                elif field_name == "stdout":
                    cls._stdout.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseResultWithStdout: " + field_name)

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
