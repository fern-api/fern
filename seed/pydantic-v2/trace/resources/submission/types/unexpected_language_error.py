from pydantic import BaseModel
from resources.commons.types.language import Language


class UnexpectedLanguageError(BaseModel):
    expected_language: Language = Field(alias="expectedLanguage")
    actual_language: Language = Field(alias="actualLanguage")
