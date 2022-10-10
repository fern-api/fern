import typing

import pydantic
import typing_extensions

from .test_case_implementation_description_board import TestCaseImplementationDescriptionBoard


class TestCaseImplementationDescription(pydantic.BaseModel):
    boards: typing.List[TestCaseImplementationDescriptionBoard]

    @pydantic.validator("boards")
    def _validate_boards(
        cls, boards: typing.List[TestCaseImplementationDescriptionBoard]
    ) -> typing.List[TestCaseImplementationDescriptionBoard]:
        for validator in TestCaseImplementationDescription.Validators._boards:
            boards = validator(boards)
        return boards

    class Validators:
        _boards: typing.ClassVar[
            typing.List[
                typing.Callable[
                    [typing.List[TestCaseImplementationDescriptionBoard]],
                    typing.List[TestCaseImplementationDescriptionBoard],
                ]
            ]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["boards"]
        ) -> typing.Callable[
            [
                typing.Callable[
                    [typing.List[TestCaseImplementationDescriptionBoard]],
                    typing.List[TestCaseImplementationDescriptionBoard],
                ]
            ],
            typing.Callable[
                [typing.List[TestCaseImplementationDescriptionBoard]],
                typing.List[TestCaseImplementationDescriptionBoard],
            ],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "boards":
                    cls._boards.append(validator)
                else:
                    raise RuntimeError("Field does not exist on TestCaseImplementationDescription: " + field_name)

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
