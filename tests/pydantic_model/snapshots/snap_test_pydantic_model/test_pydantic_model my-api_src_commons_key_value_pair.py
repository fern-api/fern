from __future__ import annotations

import pydantic


class KeyValuePair(pydantic.BaseModel):
    key: VariableValue
    value: VariableValue


from .variable_value import VariableValue  # noqa: E402

KeyValuePair.update_forward_refs()
