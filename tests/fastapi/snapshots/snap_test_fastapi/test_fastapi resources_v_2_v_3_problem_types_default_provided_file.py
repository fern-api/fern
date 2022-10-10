import typing

import pydantic
import typing_extensions

from .....commons.types.variable_type import VariableType
from .file_info_v_2 import FileInfoV2


class DefaultProvidedFile(pydantic.BaseModel):
    file: FileInfoV2
    related_types: typing.List[VariableType] = pydantic.Field(alias="relatedTypes")

    @pydantic.validator("file")
    def _validate_file(cls, file: FileInfoV2) -> FileInfoV2:
        for validator in DefaultProvidedFile.Validators._file:
            file = validator(file)
        return file

    @pydantic.validator("related_types")
    def _validate_related_types(cls, related_types: typing.List[VariableType]) -> typing.List[VariableType]:
        for validator in DefaultProvidedFile.Validators._related_types:
            related_types = validator(related_types)
        return related_types

    class Validators:
        _file: typing.ClassVar[typing.List[typing.Callable[[FileInfoV2], FileInfoV2]]] = []
        _related_types: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[VariableType]], typing.List[VariableType]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["file"]
        ) -> typing.Callable[[typing.Callable[[FileInfoV2], FileInfoV2]], typing.Callable[[FileInfoV2], FileInfoV2]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["related_types"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[VariableType]], typing.List[VariableType]]],
            typing.Callable[[typing.List[VariableType]], typing.List[VariableType]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "file":
                    cls._file.append(validator)
                elif field_name == "related_types":
                    cls._related_types.append(validator)
                else:
                    raise RuntimeError("Field does not exist on DefaultProvidedFile: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
