from __future__ import annotations

from typing import Union

from ..code_writer import CodeWriter
from .function_invocation import FunctionInvocation

Expression = Union[FunctionInvocation, CodeWriter]
