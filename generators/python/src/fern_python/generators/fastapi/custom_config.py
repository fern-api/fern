from typing import List, Literal, Optional, Union

import pydantic
from fern_python.generators.pydantic_model.custom_config import (
    BasePydanticModelCustomConfig,
    EnumTypes,
)


class FastApiPydanticModelCustomConfig(BasePydanticModelCustomConfig):
    extra_fields: Optional[Literal["allow", "forbid"]] = "forbid"
    use_str_enums: bool = False
    enum_type: EnumTypes = "python_enums"


class FastAPICustomConfig(pydantic.BaseModel):
    include_validators: bool = False
    skip_formatting: bool = False
    async_handlers: Union[bool, List[str]] = False
    pydantic_config: FastApiPydanticModelCustomConfig = FastApiPydanticModelCustomConfig()

    class Config:
        extra = pydantic.Extra.forbid

    use_inheritance_for_extended_models: bool = True
    """
    Whether to generate Pydantic models that implement inheritance when a model utilizes the Fern `extends` keyword.
    """

    @pydantic.model_validator(mode="after")
    def propagate_use_inheritance_for_extended_models(self) -> "FastAPICustomConfig":
        self.pydantic_config.use_inheritance_for_extended_models = self.use_inheritance_for_extended_models
        return self
