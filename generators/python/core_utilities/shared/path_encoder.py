import typing
import urllib.parse

from .jsonable_encoder import jsonable_encoder


def encode_path_parameter(value: typing.Any) -> str:
    if value is None:
        raise ValueError("Path parameter value cannot be 'None', this would result in a malformed URL.")
    return urllib.parse.quote(str(jsonable_encoder(value)), safe="")
