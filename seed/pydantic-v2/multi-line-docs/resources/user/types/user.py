from pydantic import BaseModel
from typing import Optional

"""A user object. This type is used throughout the following APIs:

- createUser
- getUser"""


class User(BaseModel):
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
