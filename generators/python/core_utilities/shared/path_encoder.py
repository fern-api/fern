import typing
import urllib.parse

from .jsonable_encoder import jsonable_encoder


def encode_path_parameter(value: typing.Any) -> str:
    return urllib.parse.quote(str(jsonable_encoder(value)), safe="")
