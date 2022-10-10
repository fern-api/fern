import typing

import pydantic
import typing_extensions

from .workspace_submission_update_info import WorkspaceSubmissionUpdateInfo


class WorkspaceSubmissionUpdate(pydantic.BaseModel):
    update_time: str = pydantic.Field(alias="updateTime")
    update_info: WorkspaceSubmissionUpdateInfo = pydantic.Field(alias="updateInfo")

    @pydantic.validator("update_time")
    def _validate_update_time(cls, update_time: str) -> str:
        for validator in WorkspaceSubmissionUpdate.Validators._update_time:
            update_time = validator(update_time)
        return update_time

    @pydantic.validator("update_info")
    def _validate_update_info(cls, update_info: WorkspaceSubmissionUpdateInfo) -> WorkspaceSubmissionUpdateInfo:
        for validator in WorkspaceSubmissionUpdate.Validators._update_info:
            update_info = validator(update_info)
        return update_info

    class Validators:
        _update_time: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _update_info: typing.ClassVar[
            typing.List[typing.Callable[[WorkspaceSubmissionUpdateInfo], WorkspaceSubmissionUpdateInfo]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["update_time"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["update_info"]
        ) -> typing.Callable[
            [typing.Callable[[WorkspaceSubmissionUpdateInfo], WorkspaceSubmissionUpdateInfo]],
            typing.Callable[[WorkspaceSubmissionUpdateInfo], WorkspaceSubmissionUpdateInfo],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "update_time":
                    cls._update_time.append(validator)
                elif field_name == "update_info":
                    cls._update_info.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WorkspaceSubmissionUpdate: " + field_name)

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
