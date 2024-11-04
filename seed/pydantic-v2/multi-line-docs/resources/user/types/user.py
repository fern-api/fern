from pydantic import BaseModel
from typing import Optional
from dt import datetime
from core.datetime_utils import serialize_datetime
class User(BaseModel):
"""A user object. This type is used throughout the following APIs:

- createUser
- getUser"""
    id: str
    name: str
    """
    The user's name. This name is unique to each user. A few examples are included below:
    
    - Alice
    - Bob
    - Charlie
    """
    age: Optional[int] = None
    """
    The user's age.
    """
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

