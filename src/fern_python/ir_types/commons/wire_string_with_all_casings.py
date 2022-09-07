from pydantic import Field

from .string_with_all_casings import StringWithAllCasings


class WireStringWithAllCasings(StringWithAllCasings):
    wire_value: str = Field(alias="wireValue")
