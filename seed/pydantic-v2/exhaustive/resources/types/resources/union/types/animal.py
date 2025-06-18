from typing import Union, Literal
from .dog import Dog
from .cat import Cat

class Animal_Dog(Dog):
    animal: Literal["dog"]
    class Config:
        allow_population_by_field_name = True


class Animal_Cat(Cat):
    animal: Literal["cat"]
    class Config:
        allow_population_by_field_name = True


Animal = Union[Animal_Dog, Animal_Cat]
