from typing import Any

try:
    import pydantic.v1 as pydantic  # type: ignore
except ImportError:
    import pydantic  # type: ignore
  
from collections import ChainMap

# Flattens dicts to be of the form {"key[subkey][subkey2]": value} where value is not a dict
def traverse_query_dict(dict_flat, key_prefix=None) -> dict:
  result = {}
  for k, v in dict_flat.items():
    key = f'{key_prefix}[{k}]' if key_prefix is not None else k
    if isinstance(v, dict):
      result.update(traverse_query_dict(v, key))
    else:
      result[key] = v
  return result


# This should eventually take into account array formats within queries
# and additional forms of deep object encoding, if we end up supporting them.
def single_query_encoder(query_key: str, query_value: Any) -> dict:
    if isinstance(query_value, pydantic.BaseModel) or isinstance(query_value, dict):
        if isinstance(query_value, pydantic.BaseModel):
            obj_dict = query_value.dict(by_alias=True)
        else:
            obj_dict = query_value
        return traverse_query_dict(obj_dict, query_key)

    return {query_key: query_value}


def query_encoder(query: dict) -> dict:
  return dict(ChainMap(*[single_query_encoder(k, v) for k, v in query.items()]))
