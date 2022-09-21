import typing

import pydantic

from .generator_environment import GeneratorEnvironment
from .generator_output_config import GeneratorOutputConfig
from .generator_publish_config import GeneratorPublishConfig


class GeneratorConfig(pydantic.BaseModel):
    ir_filepath: str = pydantic.Field(alias="irFilepath")
    output: GeneratorOutputConfig
    publish: typing.Optional[GeneratorPublishConfig]
    workspace_name: str = pydantic.Field(alias="workspaceName")
    organization: str
    custom_config: typing.Any = pydantic.Field(alias="customConfig")
    environment: GeneratorEnvironment

    class Config:
        allow_population_by_field_name = True
