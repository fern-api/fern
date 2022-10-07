import typing

import pydantic
import typing_extensions

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from .single_union_type import SingleUnionType


class UnionTypeDeclaration(pydantic.BaseModel):
    discriminant: str
    discriminant_v_2: WireStringWithAllCasings = pydantic.Field(alias="discriminantV2")
    types: typing.List[SingleUnionType]

    @pydantic.validator("discriminant")
    def _validate_discriminant(cls, discriminant: str) -> str:
        for validator in UnionTypeDeclaration.Validators._discriminant:
            discriminant = validator(discriminant)
        return discriminant

    @pydantic.validator("discriminant_v_2")
    def _validate_discriminant_v_2(cls, discriminant_v_2: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in UnionTypeDeclaration.Validators._discriminant_v_2:
            discriminant_v_2 = validator(discriminant_v_2)
        return discriminant_v_2

    @pydantic.validator("types")
    def _validate_types(cls, types: typing.List[SingleUnionType]) -> typing.List[SingleUnionType]:
        for validator in UnionTypeDeclaration.Validators._types:
            types = validator(types)
        return types

    class Validators:
        _discriminant: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _discriminant_v_2: typing.ClassVar[
            typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]
        ] = []
        _types: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[SingleUnionType]], typing.List[SingleUnionType]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["discriminant"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["discriminant_v_2"]
        ) -> typing.Callable[
            [typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]],
            typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["types"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[SingleUnionType]], typing.List[SingleUnionType]]],
            typing.Callable[[typing.List[SingleUnionType]], typing.List[SingleUnionType]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "discriminant":
                    cls._discriminant.append(validator)
                elif field_name == "discriminant_v_2":
                    cls._discriminant_v_2.append(validator)
                elif field_name == "types":
                    cls._types.append(validator)
                else:
                    raise RuntimeError("Field does not exist on UnionTypeDeclaration: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
