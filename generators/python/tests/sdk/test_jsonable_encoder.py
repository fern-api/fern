from typing import List

import pytest
from fern.generator_exec.logging import GeneratorUpdate, InitUpdateV2

from core_utilities.shared.jsonable_encoder import encode_path_param, jsonable_encoder, quote_path_param


def test_jsonable_encoder() -> None:
    updates: List[GeneratorUpdate] = [GeneratorUpdate.factory.init_v_2(InitUpdateV2(publishing_to_registry=None))]
    serialized = jsonable_encoder(updates)
    assert serialized == [{"_type": "initV2", "publishingToRegistry": None}]


def test_encode_path_param() -> None:
    assert encode_path_param("connections/1") == "connections/1"
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
    # every "/" is encoded, so a multi-segment value cannot change the endpoint
    assert quote_path_param("a/b/c") == "a%2Fb%2Fc"
    # already-encoded input is encoded again rather than passed through
    assert quote_path_param("a%2Fb") == "a%252Fb"


@pytest.mark.parametrize("value", [".", "..", "%2e", "%2E%2e", "a/../b", "./a"])
def test_encode_path_param_rejects_dot_segments(value: str) -> None:
    with pytest.raises(ValueError):
        encode_path_param(value)


@pytest.mark.parametrize("value", [".", ".."])
def test_quote_path_param_rejects_dot_segments(value: str) -> None:
    with pytest.raises(ValueError):
        quote_path_param(value)


def test_path_params_allow_values_containing_dots() -> None:
    assert encode_path_param("...") == "..."
    assert encode_path_param("v1.2") == "v1.2"
    assert quote_path_param("...") == "..."
    assert quote_path_param("%2e%2e") == "%252e%252e"
