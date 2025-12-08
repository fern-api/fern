import enum
import sys

if sys.version_info >= (3, 11):
    from enum import StrEnum as FernEnum
else:

    class FernEnum(str, enum.Enum):
        pass
