from pydantic import BaseModel
from resources.commons.types import Language


class UnexpectedLanguageError(BaseModel):
    expected_language: Language
    actual_language: Language
