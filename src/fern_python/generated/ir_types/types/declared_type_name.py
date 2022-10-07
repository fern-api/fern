import typing

import pydantic
import typing_extensions

from ..commons.fern_filepath import FernFilepath
from ..commons.string_with_all_casings import StringWithAllCasings


class DeclaredTypeName(pydantic.BaseModel):
    fern_filepath: FernFilepath = pydantic.Field(alias="fernFilepath")
    name: str
    name_v_2: StringWithAllCasings = pydantic.Field(alias="nameV2")

    @pydantic.validator("fern_filepath")
    def _validate_fern_filepath(cls, fern_filepath: FernFilepath) -> FernFilepath:
        for validator in DeclaredTypeName.Validators._fern_filepath:
            fern_filepath = validator(fern_filepath)
        return fern_filepath

    @pydantic.validator("name")
    def _validate_name(cls, name: str) -> str:
        for validator in DeclaredTypeName.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("name_v_2")
    def _validate_name_v_2(cls, name_v_2: StringWithAllCasings) -> StringWithAllCasings:
        for validator in DeclaredTypeName.Validators._name_v_2:
            name_v_2 = validator(name_v_2)
        return name_v_2

    class Validators:
        _fern_filepath: typing.ClassVar[typing.List[typing.Callable[[FernFilepath], FernFilepath]]] = []
        _name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _name_v_2: typing.ClassVar[typing.List[typing.Callable[[StringWithAllCasings], StringWithAllCasings]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["fern_filepath"]
        ) -> typing.Callable[
            [typing.Callable[[FernFilepath], FernFilepath]], typing.Callable[[FernFilepath], FernFilepath]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name_v_2"]
        ) -> typing.Callable[
            [typing.Callable[[StringWithAllCasings], StringWithAllCasings]],
            typing.Callable[[StringWithAllCasings], StringWithAllCasings],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "fern_filepath":
                    cls._fern_filepath.append(validator)
                elif field_name == "name":
                    cls._name.append(validator)
                elif field_name == "name_v_2":
                    cls._name_v_2.append(validator)
                else:
                    raise RuntimeError("Field does not exist on DeclaredTypeName: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
