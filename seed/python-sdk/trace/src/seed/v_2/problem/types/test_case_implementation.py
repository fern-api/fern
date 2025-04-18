# This file was auto-generated by Fern from our API Definition.

from ....core.pydantic_utilities import UniversalBaseModel
from ....commons.types.list_type import ListType
from ....commons.types.map_type import MapType
from .test_case_implementation_description import TestCaseImplementationDescription
from .test_case_function import TestCaseFunction
from ....core.pydantic_utilities import IS_PYDANTIC_V2
import typing
import pydantic


class TestCaseImplementation(UniversalBaseModel):
    description: TestCaseImplementationDescription
    function: TestCaseFunction

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow", frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow
