from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.problem.types.function_implementation import (
    FunctionImplementation,
)


class FunctionImplementationForMultipleLanguages(BaseModel):
    code_by_language: Dict[Language, FunctionImplementation] = Field(
        alias="codeByLanguage"
    )
