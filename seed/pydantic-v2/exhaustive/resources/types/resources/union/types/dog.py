from pydantic import BaseModel


class Dog(BaseModel):
    name: str
    likes_to_woof: bool
