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
        _problem_version: typing.ClassVar[int] = []

        @typing.overload
        @classmethod
        def field(problem_version: typing_extensions.Literal["problem_version"]) -> int:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "problem_version":
                    cls._problem_version.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on UpdateProblemResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
