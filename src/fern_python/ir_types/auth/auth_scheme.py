from pydantic import Field, BaseModel
from typing import Literal, Union
from typing_extensions import Annotated
from ..commons import WithDocs
from .. import services


class AuthScheme(BaseModel):
    class Bearer(WithDocs):
        type: Literal["bearer"] = Field(alias="_type")

    class Basic(WithDocs):
        type: Literal["basic"] = Field(alias="_type")

    class Header(services.HttpHeader):
        type: Literal["header"] = Field(alias="_type")

    __root__: Annotated[
        Union[Bearer, Basic, Header],
        Field(discriminator="type"),
    ]
