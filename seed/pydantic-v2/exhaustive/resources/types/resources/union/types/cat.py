from pydantic import BaseModel


class Cat(BaseModel):
    name: str
    likes_to_meow: bool = Field(alias="likesToMeow")
