from typing import List

from fern.generator_exec.logging import GeneratorUpdate, InitUpdateV2

from core_utilities.shared.jsonable_encoder import encode_path_param, jsonable_encoder, quote_path_param


def test_jsonable_encoder() -> None:
    updates: List[GeneratorUpdate] = [GeneratorUpdate.factory.init_v_2(InitUpdateV2(publishing_to_registry=None))]
    serialized = jsonable_encoder(updates)
    assert serialized == [{"_type": "initV2", "publishingToRegistry": None}]


def test_encode_path_param() -> None:
    assert encode_path_param("../connections") == "../connections"
    assert encode_path_param("user_1") == "user_1"
    assert encode_path_param(42) == "42"
    assert encode_path_param(True) == "true"
    assert encode_path_param(False) == "false"


def test_quote_path_param() -> None:
    assert quote_path_param("../connections") == "..%2Fconnections"
    assert quote_path_param("user id?") == "user%20id%3F"
    assert quote_path_param("user_1") == "user_1"
    assert quote_path_param(42) == "42"
    assert quote_path_param(True) == "true"
    assert quote_path_param(False) == "false"
