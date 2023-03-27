from typing import List

from fern.generator_exec.sdk.resources.logging import GeneratorUpdate, InitUpdateV2

from core_utilities.sdk.jsonable_encoder import jsonable_encoder


def test_jsonable_encoder() -> None:
    updates: List[GeneratorUpdate] = [GeneratorUpdate.factory.init_v_2(InitUpdateV2())]
    serialized = jsonable_encoder(updates)
    assert serialized == [{"_type": "initV2", "publishingToRegistry": None}]
