from pydantic import BaseModel
from typing import Dict
from resources.commons.types import Language


class GetFunctionSignatureResponse(BaseModel):
    function_by_language: Dict[Language, str]
