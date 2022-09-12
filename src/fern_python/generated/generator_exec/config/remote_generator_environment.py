import pydantic

from ..logging.task_id import TaskId


class RemoteGeneratorEnvironment(pydantic.BaseModel):
    coordinator_url: str = pydantic.Field(alias="coordinatorUrl")
    coordinator_url_v2: str = pydantic.Field(alias="coordinatorUrlV2")
    id: TaskId

    class Config:
        allow_population_by_field_name = True
