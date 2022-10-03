import typing

import pydantic


class TestCaseExpects(pydantic.BaseModel):
    expected_stdout: typing.Optional[str] = pydantic.Field(alias="expectedStdout")

    class Config:
        allow_population_by_field_name = True
