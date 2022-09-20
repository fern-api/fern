from __future__ import annotations

from typing import Union

from ..code_writer import CodeWriter
from .class_instantiation import ClassInstantiation
from .function_invocation import FunctionInvocation

Expression = Union[FunctionInvocation, CodeWriter, ClassInstantiation]
