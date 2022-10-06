import typing

import pydantic
import typing_extensions

from ...commons.language import Language
from .file_info_v2 import FileInfoV2


class GetBasicSolutionFileResponse(pydantic.BaseModel):
    solution_file_by_language: typing.Dict[Language, FileInfoV2] = pydantic.Field(alias="solutionFileByLanguage")

    @pydantic.validator("solution_file_by_language")
    def _validate_solution_file_by_language(
        cls, solution_file_by_language: typing.Dict[Language, FileInfoV2]
    ) -> typing.Dict[Language, FileInfoV2]:
        for validator in GetBasicSolutionFileResponse.Validators._solution_file_by_language:
            solution_file_by_language = validator(solution_file_by_language)
        return solution_file_by_language

    class Validators:
        _solution_file_by_language: typing.ClassVar[typing.Dict[Language, FileInfoV2]] = []

        @typing.overload
        @classmethod
        def field(
            solution_file_by_language: typing_extensions.Literal["solution_file_by_language"],
        ) -> typing.Dict[Language, FileInfoV2]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "solution_file_by_language":
                    cls._solution_file_by_language.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on GetBasicSolutionFileResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
