import typing

import pydantic
import typing_extensions


class UpdateProblemResponse(pydantic.BaseModel):
    problem_version: int = pydantic.Field(alias="problemVersion")

    @pydantic.validator("problem_version")
    def _validate_problem_version(cls, problem_version: int) -> int:
        for validator in UpdateProblemResponse.Validators._problem_version:
            problem_version = validator(problem_version)
        return problem_version

    class Validators:
        _problem_version: typing.ClassVar[typing.List[typing.Callable[[int], int]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_version"]
        ) -> typing.Callable[[typing.Callable[[int], int]], typing.Callable[[int], int]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "problem_version":
                    cls._problem_version.append(validator)
                else:
                    raise RuntimeError("Field does not exist on UpdateProblemResponse: " + field_name)

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
