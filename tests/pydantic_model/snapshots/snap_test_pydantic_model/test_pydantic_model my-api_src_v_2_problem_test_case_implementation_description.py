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
        _boards: typing.ClassVar[typing.List[TestCaseImplementationDescriptionBoard]] = []

        @typing.overload
        @classmethod
        def field(boards: typing_extensions.Literal["boards"]) -> typing.List[TestCaseImplementationDescriptionBoard]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "boards":
                    cls._boards.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on TestCaseImplementationDescription: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
