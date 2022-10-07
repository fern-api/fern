import typing

import pydantic
import typing_extensions

from ...commons.fern_filepath import FernFilepath


class DeclaredServiceName(pydantic.BaseModel):
    fern_filepath: FernFilepath = pydantic.Field(alias="fernFilepath")
    name: str

    @pydantic.validator("fern_filepath")
    def _validate_fern_filepath(cls, fern_filepath: FernFilepath) -> FernFilepath:
        for validator in DeclaredServiceName.Validators._fern_filepath:
            fern_filepath = validator(fern_filepath)
        return fern_filepath

    @pydantic.validator("name")
    def _validate_name(cls, name: str) -> str:
        for validator in DeclaredServiceName.Validators._name:
            name = validator(name)
        return name

    class Validators:
        _fern_filepath: typing.ClassVar[typing.List[typing.Callable[[FernFilepath], FernFilepath]]] = []
        _name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

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

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "fern_filepath":
                    cls._fern_filepath.append(validator)
                elif field_name == "name":
                    cls._name.append(validator)
                else:
                    raise RuntimeError("Field does not exist on DeclaredServiceName: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
