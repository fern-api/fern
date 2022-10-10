import typing

import pydantic
import typing_extensions

from .workspace_submission_update import WorkspaceSubmissionUpdate


class WorkspaceSubmissionStatusV2(pydantic.BaseModel):
    updates: typing.List[WorkspaceSubmissionUpdate]

    @pydantic.validator("updates")
    def _validate_updates(
        cls, updates: typing.List[WorkspaceSubmissionUpdate]
    ) -> typing.List[WorkspaceSubmissionUpdate]:
        for validator in WorkspaceSubmissionStatusV2.Validators._updates:
            updates = validator(updates)
        return updates

    class Validators:
        _updates: typing.ClassVar[
            typing.List[
                typing.Callable[[typing.List[WorkspaceSubmissionUpdate]], typing.List[WorkspaceSubmissionUpdate]]
            ]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["updates"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[WorkspaceSubmissionUpdate]], typing.List[WorkspaceSubmissionUpdate]]],
            typing.Callable[[typing.List[WorkspaceSubmissionUpdate]], typing.List[WorkspaceSubmissionUpdate]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "updates":
                    cls._updates.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WorkspaceSubmissionStatusV2: " + field_name)

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
