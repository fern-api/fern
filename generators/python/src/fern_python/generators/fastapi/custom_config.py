from typing import List, Literal, Optional, Union

import pydantic
from fern_python.generators.pydantic_model.custom_config import (
    BasePydanticModelCustomConfig,
)


class FastApiPydanticModelCustomConfig(BasePydanticModelCustomConfig):
    extra_fields: Optional[Literal["allow", "forbid"]] = "forbid"
    use_str_enums: bool = False


class FastAPICustomConfig(pydantic.BaseModel):
    include_validators: bool = False
    skip_formatting: bool = False
    async_handlers: Union[bool, List[str]] = False
    pydantic_config: FastApiPydanticModelCustomConfig = FastApiPydanticModelCustomConfig()
