from __future__ import annotations

import typing

import pydantic
import typing_extensions


class MapValue(pydantic.BaseModel):
    key_value_pairs: typing.List[KeyValuePair] = pydantic.Field(alias="keyValuePairs")

    @pydantic.validator("key_value_pairs")
    def _validate_key_value_pairs(cls, key_value_pairs: typing.List[KeyValuePair]) -> typing.List[KeyValuePair]:
        for validator in MapValue.Validators._key_value_pairs:
            key_value_pairs = validator(key_value_pairs)
        return key_value_pairs

    class Validators:
        _key_value_pairs: typing.ClassVar[typing.List[KeyValuePair]] = []

        @typing.overload
        @classmethod
        def field(key_value_pairs: typing_extensions.Literal["key_value_pairs"]) -> typing.List[KeyValuePair]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "key_value_pairs":
                    cls._key_value_pairs.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on MapValue: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True


from .key_value_pair import KeyValuePair  # noqa: E402

MapValue.update_forward_refs()
