import pydantic

from ..pydantic_model.custom_config import FastApiPydanticModelCustomConfig


class FastAPICustomConfig(pydantic.BaseModel):
    include_validators: bool = False
    skip_formatting: bool = False
    async_handlers: bool = False
    pydantic_config: FastApiPydanticModelCustomConfig = FastApiPydanticModelCustomConfig()
