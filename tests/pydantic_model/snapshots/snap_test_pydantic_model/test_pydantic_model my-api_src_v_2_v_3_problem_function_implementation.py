import typing

import pydantic


class FunctionImplementation(pydantic.BaseModel):
    impl: str
    imports: typing.Optional[str]
