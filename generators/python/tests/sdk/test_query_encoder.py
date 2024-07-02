from typing import List
from fern.generator_exec.resources.logging import GeneratorUpdate, InitUpdateV2
from core_utilities.sdk.jsonable_encoder import jsonable_encoder
from core_utilities.sdk.query_encoder import encode_query

def test_encode_query_with_values() -> None:
    updates: GeneratorUpdate = GeneratorUpdate.factory.init_v_2(InitUpdateV2(publishing_to_registry=None))
    encoded = encode_query(jsonable_encoder(updates))
    assert encoded == {'_type': 'initV2', 'publishingToRegistry': None}


def test_encode_query_with_none() -> None:
    encoded = encode_query(None)
    assert encoded == None