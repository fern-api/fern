from __future__ import annotations

import typing

import pydantic
import typing_extensions


class DebugMapValue(pydantic.BaseModel):
    key_value_pairs: typing.List[DebugKeyValuePairs] = pydantic.Field(alias="keyValuePairs")

    @pydantic.validator("key_value_pairs")
    def _validate_key_value_pairs(
        cls, key_value_pairs: typing.List[DebugKeyValuePairs]
    ) -> typing.List[DebugKeyValuePairs]:
        for validator in DebugMapValue.Validators._key_value_pairs:
            key_value_pairs = validator(key_value_pairs)
        return key_value_pairs

    class Validators:
        _key_value_pairs: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[DebugKeyValuePairs]], typing.List[DebugKeyValuePairs]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["key_value_pairs"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[DebugKeyValuePairs]], typing.List[DebugKeyValuePairs]]],
            typing.Callable[[typing.List[DebugKeyValuePairs]], typing.List[DebugKeyValuePairs]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "key_value_pairs":
                    cls._key_value_pairs.append(validator)
                else:
                    raise RuntimeError("Field does not exist on DebugMapValue: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True


from .debug_key_value_pairs import DebugKeyValuePairs  # noqa: E402

DebugMapValue.update_forward_refs()
