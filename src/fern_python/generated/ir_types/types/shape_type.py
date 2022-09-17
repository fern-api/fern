from enum import Enum


class ShapeType(str, Enum):
    enum = "ENUM"
    object = "OBJECT"
    union = "UNION"
