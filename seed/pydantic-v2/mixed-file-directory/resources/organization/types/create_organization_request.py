from pydantic import BaseModel


class CreateOrganizationRequest(BaseModel):
    name: str
