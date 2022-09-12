import pydantic

from .generator_registries_config_v2 import GeneratorRegistriesConfigV2


class GeneratorPublishConfig(pydantic.BaseModel):
    registries_v2: GeneratorRegistriesConfigV2 = pydantic.Field(alias="registriesV2")
    version: str
