from enum import Enum, auto


class ImportConstraint(Enum):
    BEFORE_CURRENT_DECLARATION = auto()
    AFTER_CURRENT_DECLARATION = auto()
