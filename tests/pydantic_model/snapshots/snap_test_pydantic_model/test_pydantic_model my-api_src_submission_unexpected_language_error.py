import pydantic

from ..commons.language import Language


class UnexpectedLanguageError(pydantic.BaseModel):
    expected_language: Language = pydantic.Field(alias="expectedLanguage")
    actual_language: Language = pydantic.Field(alias="actualLanguage")

    class Config:
        allow_population_by_field_name = True
