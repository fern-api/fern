import pydantic

from .string_with_all_casings import StringWithAllCasings


class WireStringWithAllCasings(StringWithAllCasings):
    wire_value: str = pydantic.Field(alias="wireValue")

    class Config:
        allow_population_by_field_name = True
