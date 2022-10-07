import typing

import pydantic
import typing_extensions

from ...commons.with_docs import WithDocs
from ...types.type_reference import TypeReference


class HttpRequest(WithDocs):
    type: TypeReference
    type_v_2: typing.Optional[TypeReference] = pydantic.Field(alias="typeV2")

    @pydantic.validator("type")
    def _validate_type(cls, type: TypeReference) -> TypeReference:
        for validator in HttpRequest.Validators._type:
            type = validator(type)
        return type

    @pydantic.validator("type_v_2")
    def _validate_type_v_2(cls, type_v_2: typing.Optional[TypeReference]) -> typing.Optional[TypeReference]:
        for validator in HttpRequest.Validators._type_v_2:
            type_v_2 = validator(type_v_2)
        return type_v_2

    class Validators:
        _type: typing.ClassVar[typing.List[typing.Callable[[TypeReference], TypeReference]]] = []
        _type_v_2: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[TypeReference]], typing.Optional[TypeReference]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["type"]
        ) -> typing.Callable[
            [typing.Callable[[TypeReference], TypeReference]], typing.Callable[[TypeReference], TypeReference]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["type_v_2"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[TypeReference]], typing.Optional[TypeReference]]],
            typing.Callable[[typing.Optional[TypeReference]], typing.Optional[TypeReference]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "type":
                    cls._type.append(validator)
                elif field_name == "type_v_2":
                    cls._type_v_2.append(validator)
                else:
                    raise RuntimeError("Field does not exist on HttpRequest: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
