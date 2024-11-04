from pydantic import BaseModel
from types.root_type import RootType


class A(BaseModel, RootType):
    pass
