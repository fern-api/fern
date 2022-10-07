import typing

import pydantic
import typing_extensions


class TestCaseHiddenGrade(pydantic.BaseModel):
    passed: bool

    @pydantic.validator("passed")
    def _validate_passed(cls, passed: bool) -> bool:
        for validator in TestCaseHiddenGrade.Validators._passed:
            passed = validator(passed)
        return passed

    class Validators:
        _passed: typing.ClassVar[typing.List[typing.Callable[[bool], bool]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["passed"]
        ) -> typing.Callable[[typing.Callable[[bool], bool]], typing.Callable[[bool], bool]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "passed":
                    cls._passed.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseHiddenGrade: " + field_name)

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
