import importlib
import json
import shutil
import sys
import types
import typing
from pathlib import Path

import pytest
import typing_extensions

import pydantic
from core_utilities.shared.pydantic_utilities import IS_PYDANTIC_V2, UniversalBaseModel, parse_obj_as
from core_utilities.shared.serialization import FieldMetadata
from core_utilities.shared.unchecked_base_model import UncheckedBaseModel, construct_type


class Amount(UncheckedBaseModel):
    iso_currency_code: str
    value: float


class AllowsExtras(UniversalBaseModel):
    value: float
    account_id: str = pydantic.Field(alias="accountId")

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow")  # type: ignore # Pydantic v2
    else:

        class Config:
            extra = pydantic.Extra.allow


class MetadataAlias(UncheckedBaseModel):
    account_id: typing_extensions.Annotated[str, FieldMetadata(alias="accountId")]


class Payee(UncheckedBaseModel):
    name: str
    amount: Amount


UNTRUSTED_AMOUNT = {"iso_currency_code": "GBP", "value": 99999, "VALUE": 99999, "brand_new_field": "keep-me"}


def _validate(model: typing.Type[pydantic.BaseModel], data: typing.Dict[str, typing.Any]) -> typing.Any:
    if IS_PYDANTIC_V2:
        return model.model_validate(data)  # type: ignore[attr-defined]
    return model.parse_obj(data)


def _copy(model: typing.Any, update: typing.Dict[str, typing.Any]) -> typing.Any:
    if IS_PYDANTIC_V2:
        return model.model_copy(update=update)
    return model.copy(update=update)


def test_validate_drops_case_insensitive_collision_and_keeps_other_extras() -> None:
    amount = _copy(_validate(Amount, UNTRUSTED_AMOUNT), {"value": 1.0})
    assert json.loads(amount.json()) == {"iso_currency_code": "GBP", "value": 1.0, "brand_new_field": "keep-me"}


def test_construct_drops_case_insensitive_collision_and_keeps_other_extras() -> None:
    amount = construct_type(type_=Amount, object_=UNTRUSTED_AMOUNT)
    assert json.loads(amount.json()) == {"iso_currency_code": "GBP", "value": 99999, "brand_new_field": "keep-me"}


def test_parse_obj_as_drops_collision_in_nested_models() -> None:
    payee = parse_obj_as(Payee, {"name": "Legit", "NAME": "Attacker", "amount": UNTRUSTED_AMOUNT})
    assert json.loads(payee.json()) == {
        "name": "Legit",
        "amount": {"iso_currency_code": "GBP", "value": 99999, "brand_new_field": "keep-me"},
    }


def test_collision_with_pydantic_alias_and_field_name() -> None:
    model = _validate(AllowsExtras, {"value": 1, "accountId": "a", "ACCOUNTID": "x", "Account_Id": "y", "extra": "e"})
    assert json.loads(model.json()) == {"value": 1, "accountId": "a", "extra": "e"}


def test_collision_with_field_metadata_alias() -> None:
    wire = {"accountId": "a", "ACCOUNTID": "x", "other": "o"}
    assert parse_obj_as(MetadataAlias, wire).dict() == {"accountId": "a", "other": "o"}
    assert construct_type(type_=MetadataAlias, object_=wire).dict() == {"accountId": "a", "other": "o"}


def test_models_that_ignore_extras_are_unchanged() -> None:
    class Ignores(UniversalBaseModel):
        value: float

    assert json.loads(_validate(Ignores, {"value": 1, "VALUE": 2}).json()) == {"value": 1}


_SHARED = Path(__file__).resolve().parents[2] / "core_utilities" / "shared"


def _load_variant(tmp_path: Path, variant: str) -> types.ModuleType:
    """The variant templates use relative imports, so import them from a copy laid out like a generated `core`."""
    package = tmp_path / f"variant_core_{variant.replace('/', '_')}"
    package.mkdir()
    for module in ("__init__.py", "datetime_utils.py", "serialization.py"):
        shutil.copy(_SHARED / module, package / module)
    shutil.copy(_SHARED / variant / "pydantic_utilities.py", package / "pydantic_utilities.py")
    sys.path.insert(0, str(tmp_path))
    try:
        return importlib.import_module(f"{package.name}.pydantic_utilities")
    finally:
        sys.path.remove(str(tmp_path))


def _assert_variant_drops_colliding_extras(module: types.ModuleType, v1_api: typing.Any) -> None:
    field = v1_api.Field if v1_api is not None else pydantic.Field

    class VariantAmount(module.UniversalBaseModel):  # type: ignore[name-defined, misc]
        value: float
        account_id: str = field(alias="accountId")  # type: ignore[call-overload]

        if v1_api is None and IS_PYDANTIC_V2:
            model_config = pydantic.ConfigDict(extra="allow")  # type: ignore[typeddict-unknown-key]
        else:

            class Config:
                extra = (v1_api or pydantic).Extra.allow

    parsed = VariantAmount.parse_obj(
        {"value": 1, "VALUE": 99999, "accountId": "a", "ACCOUNTID": "x", "brand_new_field": "keep-me"}
    )
    sent = json.loads(parsed.json())
    assert sent["value"] == 1.0
    assert sent["brand_new_field"] == "keep-me"
    assert "VALUE" not in sent and "ACCOUNTID" not in sent


def test_with_pydantic_aliases_variant(tmp_path: Path) -> None:
    _assert_variant_drops_colliding_extras(_load_variant(tmp_path, "with_pydantic_aliases"), None)


@pytest.mark.skipif(not IS_PYDANTIC_V2, reason="v1_on_v2 templates need pydantic.v1 from Pydantic 2")
@pytest.mark.parametrize("variant", ["with_pydantic_v1_on_v2", "with_pydantic_v1_on_v2/with_aliases"])
def test_v1_on_v2_variants(tmp_path: Path, variant: str) -> None:
    import pydantic.v1 as pydantic_v1  # type: ignore[import-not-found]

    _assert_variant_drops_colliding_extras(_load_variant(tmp_path, variant), pydantic_v1)
