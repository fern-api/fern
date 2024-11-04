from pydantic import BaseModel
from typing import Dict
from resources.commons.types import Language
from resources.v_2.resources.problem.types import FunctionImplementation


class FunctionImplementationForMultipleLanguages(BaseModel):
    code_by_language: Dict[Language, FunctionImplementation]
