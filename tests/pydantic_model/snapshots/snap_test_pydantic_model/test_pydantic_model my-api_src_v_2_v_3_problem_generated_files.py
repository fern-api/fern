import typing

import pydantic

from ....commons.language import Language
from .files import Files


class GeneratedFiles(pydantic.BaseModel):
    generated_test_case_files: typing.Dict[Language, Files] = pydantic.Field(alias="generatedTestCaseFiles")
    generated_template_files: typing.Dict[Language, Files] = pydantic.Field(alias="generatedTemplateFiles")
    other: typing.Dict[Language, Files]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
