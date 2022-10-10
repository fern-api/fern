import typing

import pydantic
import typing_extensions


class TestCaseExpects(pydantic.BaseModel):
    expected_stdout: typing.Optional[str] = pydantic.Field(alias="expectedStdout")

    @pydantic.validator("expected_stdout")
    def _validate_expected_stdout(cls, expected_stdout: typing.Optional[str]) -> typing.Optional[str]:
        for validator in TestCaseExpects.Validators._expected_stdout:
            expected_stdout = validator(expected_stdout)
        return expected_stdout

    class Validators:
        _expected_stdout: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[str]], typing.Optional[str]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["expected_stdout"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[str]], typing.Optional[str]]],
            typing.Callable[[typing.Optional[str]], typing.Optional[str]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "expected_stdout":
                    cls._expected_stdout.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseExpects: " + field_name)

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
