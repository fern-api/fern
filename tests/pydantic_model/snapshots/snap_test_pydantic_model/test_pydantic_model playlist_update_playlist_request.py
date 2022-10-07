import typing

import pydantic
import typing_extensions

from ..commons.problem_id import ProblemId


class UpdatePlaylistRequest(pydantic.BaseModel):
    name: str
    problems: typing.List[ProblemId]

    @pydantic.validator("name")
    def _validate_name(cls, name: str) -> str:
        for validator in UpdatePlaylistRequest.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("problems")
    def _validate_problems(cls, problems: typing.List[ProblemId]) -> typing.List[ProblemId]:
        for validator in UpdatePlaylistRequest.Validators._problems:
            problems = validator(problems)
        return problems

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _problems: typing.ClassVar[typing.List[typing.Callable[[typing.List[ProblemId]], typing.List[ProblemId]]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problems"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[ProblemId]], typing.List[ProblemId]]],
            typing.Callable[[typing.List[ProblemId]], typing.List[ProblemId]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "problems":
                    cls._problems.append(validator)
                else:
                    raise RuntimeError("Field does not exist on UpdatePlaylistRequest: " + field_name)

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
