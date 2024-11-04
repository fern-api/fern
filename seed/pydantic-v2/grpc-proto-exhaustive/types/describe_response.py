from pydantic import BaseModel
from typing import Optional, Dict
from .types.namespace_summary import NamespaceSummary


class DescribeResponse(BaseModel):
    namespaces: Optional[Dict[str, NamespaceSummary]] = None
    dimension: Optional[int] = None
    fullness: Optional[float] = None
    total_count: Optional[int] = Field(alias="totalCount", default=None)
