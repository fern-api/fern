import pydantic


class GeneratorOutputConfig(pydantic.BaseModel):
    path: str
