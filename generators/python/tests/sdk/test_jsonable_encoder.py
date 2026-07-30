from typing import List

from fern.generator_exec.logging import GeneratorUpdate, InitUpdateV2

from core_utilities.shared.jsonable_encoder import encode_path_param, jsonable_encoder


def test_jsonable_encoder() -> None:
    updates: List[GeneratorUpdate] = [GeneratorUpdate.factory.init_v_2(InitUpdateV2(publishing_to_registry=None))]
    serialized = jsonable_encoder(updates)
    assert serialized == [{"_type": "initV2", "publishingToRegistry": None}]


def test_encode_path_param() -> None:
    assert encode_path_param("../connections") == "..%2Fconnections"
    assert encode_path_param("user id?") == "user%20id%3F"
    assert encode_path_param("user_1") == "user_1"
    assert encode_path_param(42) == "42"
    assert encode_path_param(True) == "true"
    assert encode_path_param(False) == "false"
